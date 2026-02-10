import React from 'react';
import PropTypes from 'prop-types';
import {
    Users,
    CheckCircle,
    BookOpen
} from 'lucide-react';
import StatCard from './StatCard';

const StaffDashboard = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <StatCard
                index={0}
                title="Total Students"
                value={stats.totalStudents}
                icon={Users}
                color="bg-primary-600 text-white shadow-primary-600/40"
            />
            <StatCard
                index={1}
                title="Active Students"
                value={stats.activeStudents}
                icon={CheckCircle}
                color="bg-emerald-600 text-white shadow-emerald-600/40"
            />
            <StatCard
                index={2}
                title="Total Enrollments"
                value={stats.activeEnrollments}
                icon={BookOpen}
                color="bg-primary-950 text-white shadow-primary-950/40"
            />
        </div>
    );
};

StaffDashboard.propTypes = {
    stats: PropTypes.shape({
        totalStudents: PropTypes.number,
        activeStudents: PropTypes.number,
        activeEnrollments: PropTypes.number
    }).isRequired
};

export default StaffDashboard;
