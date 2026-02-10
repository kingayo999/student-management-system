# Student Management System (SMS) | Enterprise Full-Stack Application

A robust, multi-tenant capable Student Management System engineered for high-availability academic administration. Built with a modern distributed architecture, this system streamlines the student lifecycle from enrollment to graduation through automated workflows and granular security controls.

## 1. Project Overview
This platform serves as a centralized hub for university operations, integrating academic record management, financial tracking, and system-wide auditing. It is designed to replace fragmented legacy workflows with a unified, real-time data environment.

## 2. Problem Statement
Educational institutions often struggle with:
- **Data Silos**: Disconnected systems for finance, academics, and administration.
- **Security Vulnerabilities**: Lack of row-level enforcement on sensitive student data.
- **Latency**: Slow legacy systems during peak registration periods.
- **Audit Trails**: Difficulty in tracking administrative changes and financial transactions.

This system addresses these by utilizing a **BaaS (Backend-as-a-Service)** architecture with **Supabase**, ensuring sub-second data synchronization and industrial-grade security at the database level.

## 3. Features
### Administration & Staff
- **Unified Command Center**: Real-time analytics on student demographics and departmental distribution.
- **Lifecycle Management**: CRUD operations on student records with automated matriculation number generation.
- **Academic Infrastructure**: Dynamic course catalog management with departmental scoping.
- **Financial Oversight**: Integrated payment verification and hostel accommodation allocation.
- **System Auditing**: Immutable logs of all administrative actions for compliance.

### Student Portal
- **Self-Service Dashboard**: Instant access to academic standing, current level, and registration status.
- **Digital Registrar**: Course self-enrollment and real-time result viewing.
- **Financial Status**: Transparent payment history and transaction reference tracking.
- **Accommodation**: Centralized hostel and bed-space management.

## 4. User Roles & Permissions
| Role | Access Level | Responsibilities |
| :--- | :--- | :--- |
| **Admin** | Superuser | System config, audit logs, full student/staff CRUD, college hierarchy management. |
| **Staff** | Departmental | Student record updates, enrollment management, grade entry, departmental reporting. |
| **Student** | Personal | Profile management, course registration, results retrieval, payment history. |

## 5. Tech Stack
- **Frontend**: React 19 (Hooks, Context API), Tailwind CSS 4 (Custom Design System).
- **Core Engine**: Vite 7 (Optimized Rollup bundling, vendor chunking).
- **Backend & DB**: Supabase (PostgreSQL 15+), Realtime Engine, Auth (GoTrue).
- **State & Routing**: React Router 7, custom `AuthContext` with persistent profile caching.
- **Utilities**: Lucide Icons, DOMPurify (XSS Sanitization), Vitest (Testing Suite).

## 6. System Architecture
```text
[ Client Layer: React 19 ]
       │
       ▼ (HTTPS / WebSocket)
[ API Gateway: Supabase Edge Functions / PostgREST ]
       │
       ▼
[ Logic & Identity: Supabase Auth (JWT) ]
       │
       ▼
[ Data Layer: PostgreSQL 15 ]
  ├─ Row Level Security (RLS) Enforcement
  ├─ Database Triggers (Audit Logs, Auto-Timestamps)
  └─ Stored Procedures (Complex RPC Analytics)
```

## 7. Database Schema Overview
The schema is normalized to 3NF to ensure data integrity:
- `profiles`: Centralized identity linked to Auth UUID.
- `students` / `staff`: Specialized entities with foreign keys to `departments`.
- `colleges` / `departments`: Hierarchical university structure.
- `courses` / `student_courses`: M:N relationship for enrollments.
- `payments`: Transactional ledger with unique reference constraints.
- `audit_logs`: JSONB-backed storage for historical state changes.

## 8. Security Model
### Authentication
- JWT-based session management via Supabase Auth.
- Persistent session logic with background profile synchronization.

### Row Level Security (RLS)
The database enforces security independently of the frontend:
- **Tenant Isolation**: Students can `SELECT` only records where `user_id = auth.uid()`.
- **RBAC**: Staff/Admin functions restricted via database-side `is_admin()` and `is_staff()` SQL functions.
- **Soft Deletes**: Student records utilize a `deleted_at` timestamp to satisfy data retention policies without data loss.

## 9. Scalability Strategy
- **Database Indexing**: Optimized B-Tree indexes on `reg_no`, `department_id`, and `created_at`.
- **Frontend Performance**: Route-based code splitting using `React.lazy()` and `Suspense`. Vendor chunking in `vite.config.js` to minimize initial bundle size.
- **Caching**: LocalStorage caching for user profiles to mitigate API latency on repetitive navigation.

## 10. Trade-offs & Design Decisions
- **BaaS Over Custom API**: Chosen to accelerate development and leverage battle-tested security (RLS) and real-time capabilities.
- **Tailwind CSS 4**: Selected for rapid UI development and maintaining a consistent theme without the overhead of heavy component libraries.
- **Soft Delete Pattern**: Chosen over hard deletes to maintain audit integrity and allow for accidental deletion recovery.

## 11. Setup Instructions
1. **Clone & Install**:
   ```bash
   git clone [repository-url]
   npm install
   ```
2. **Database Setup**:
   - Create a Supabase project.
   - Execute `supabase_complete_schema.sql` and `dashboard_rpcs.sql` in the SQL Editor.
3. **Environment**:
   - Configure `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. **Run**:
   ```bash
   npm run dev
   ```

## 12. Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-encrypted-anon-key
```

## 13. Deployment
- **Frontend**: Optimized for Vercel or GitHub Pages (refer to `vercel.json` for routing rewrites).
- **Backend**: Managed by Supabase (Cloud Infrastructure).

## 14. Future Improvements
- [ ] **Email/SMS Notifications**: Integration via Twilio or Resend for automated alerts.
- [ ] **Document Generation**: PDF transcript and fee receipt generator.
- [ ] **Analytics Engine**: Advanced data visualization for academic performance trends.
- [ ] **Offline Resilience**: Service worker integration for core PWA features.
