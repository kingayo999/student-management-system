import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, index = 0 }) => (
    <div className={`academic-card p-5 sm:p-10 relative overflow-hidden group animate-slide-up`} style={{ animationDelay: `${index * 100}ms` }}>
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary-50 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:bg-primary-100 transition-colors duration-500"></div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className={`p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] ${color} shadow-lg ring-4 ring-white`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 uppercase tracking-widest">{trend}</span>
                    </div>
                )}
            </div>
            <p className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-1.5 sm:mb-2 ml-1">{title}</p>
            <h3 className="text-3xl sm:text-4xl font-black text-primary-950 tracking-tighter font-heading">{value}</h3>
        </div>
    </div>
);

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string.isRequired,
    trend: PropTypes.string,
    index: PropTypes.number
};

export default StatCard;
