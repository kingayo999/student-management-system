# Bellstech Student Management System (SMS)

A premium, customized Student Management System for **Bells University of Technology, Ota**. Built with React, Tailwind CSS, and Supabase, specifically branded with the official university colors: **Emerald Green** and **Gold**.


## Features

- **Role-Based Access Control (RBAC)**: Admin, Staff, and Student roles with specific permissions.
- **Secure Authentication**: Handled by Supabase Auth.
- **Student Management**: CRUD operations for student records.
- **Course Management**: Curriculum tracking and enrollment visibility.
- **Interactive Dashboards**: Role-specific analytics and overviews.
- **Row Level Security (RLS)**: Database-level security enforcing permissions.
- **Responsive Design**: Fully functional on mobile, tablet, and desktop.

## Tech Stack

- **Frontend**: React (Vite), React Router, Tailwind CSS, Lucide Icons.
- **Backend/Database**: Supabase (PostgreSQL, Auth, RLS).
- **State Management**: React Context API.

## Advanced Architecture

### Audit Logging
Accountability is ensured through the `audit_logs` table. Every sensitive write (student deactivation, course creation) is logged with the actor's ID and timestamp. This process is non-blocking to ensure a smooth UX.

### Soft Delete Strategy
Students are never physically deleted from the `students` table. Instead, a `deleted_at` timestamp is set.
- **Rationale**: Data recovery and historical record keeping.
- **Security**: RLS prevents standard users from seeing soft-deleted records.

### Admin Analytics & Security
Metrics are calculated using a **PostgreSQL Stored Procedure (RPC)** named `get_admin_stats`.
- **Efficiency**: Aggregation happens on the database server, not the client.
- **Security**: Access is strictly enforced via a `SECURITY DEFINER` function that checks the caller's role.

### Security Model (RLS)
We use Supabase Row Level Security to ensure that:
1. Admins see everything.
2. Staff see only relevant academic data.
3. Students see ONLY their own personal profile and assigned courses.

---

## Technical Decisions (Junior Engineer Focus)
- **Modularity**: Separation of services (Supabase), context (Auth), and UI components.
- **Defensive Coding**: Supabase client initialization is guarded against missing environment variables.
- **UX Maturity**: Real-time feedback for unauthorized access and global error boundaries for stability.

## Database Schema

- `profiles`: User profiles linked to Supabase Auth.
- `students`: Detailed student records.
- `courses`: Academic courses.
- `student_courses`: Junction table for student-course enrollments.

## Setup Instructions

### 1. Supabase Project
1. Create a new project on [Supabase](https://supabase.com).
2. Run the SQL provided in `supabase_schema.sql` in the Supabase SQL Editor.
3. Enable Email Auth in the Supabase Dashboard.

### 2. Local Environment
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file from `.env.example` and add your Supabase URL and Anon Key.
4. Run `npm run dev` to start the development server.

## Future Improvements

- [ ] Automated grade management system.
- [ ] Attendance tracking via QR codes.
- [ ] Fee payment integration.
- [ ] Real-time notifications for students and staff.
