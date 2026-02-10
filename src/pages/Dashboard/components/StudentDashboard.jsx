import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../../../services/supabase';
import { Users, Upload, Loader2 } from 'lucide-react';
import EmptyState from '../../../components/common/EmptyState';

const StudentDashboard = ({ profile, studentData }) => {
    const [uploading, setUploading] = useState(false);
    const [passportUrl, setPassportUrl] = useState(studentData?.student_info?.passport_url || null);

    const handlePassportUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG, JPG, or PNG)');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            // Get student record
            const { data: student, error: studentError } = await supabase
                .from('students')
                .select('id')
                .eq('user_id', profile.id)
                .single();

            if (studentError || !student) {
                throw new Error('Student record not found');
            }

            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${student.id}_${Date.now()}.${fileExt}`;
            const filePath = `passports/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('student-assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('student-assets')
                .getPublicUrl(filePath);

            // Update student record with passport URL
            const { error: updateError } = await supabase
                .from('students')
                .update({ passport_url: publicUrl })
                .eq('id', student.id);

            if (updateError) throw updateError;

            // Update local state
            setPassportUrl(publicUrl);
            alert('Passport photo updated successfully!');
        } catch (err) {
            console.error('Error uploading passport:', err);
            alert('Failed to upload passport photo: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    if (!studentData?.student_found) {
        return (
            <EmptyState
                icon={Users}
                title="No Student Profile Found"
                description="Your student profile could not be loaded. Please contact the administration for assistance."
            />
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1 space-y-8">
                <div className="academic-card p-8 flex flex-col items-center text-center">
                    <div className="w-48 h-48 mb-6 relative group">
                        <div className="absolute inset-0 bg-primary-100 rounded-full animate-pulse group-hover:bg-primary-200 transition-colors"></div>
                        <img
                            src={passportUrl || profile?.passport_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=0f172a&color=fff`}
                            alt="Student Passport"
                            className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl relative z-10"
                        />
                        <div className="absolute bottom-2 right-2 z-20 bg-accent-500 p-2 rounded-full border border-white shadow-lg pointer-events-none">
                            <Users className="w-4 h-4 text-primary-950" />
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 bg-primary-950/50 rounded-full flex items-center justify-center z-30">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        id="passport-upload"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        onChange={handlePassportUpload}
                    />
                    <label
                        htmlFor="passport-upload"
                        className="cursor-pointer inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-600 hover:text-accent-700 hover:underline mb-6 transition-colors"
                    >
                        <Upload className="w-3 h-3" />
                        Update Passport
                    </label>

                    <div className="w-full space-y-4 text-left">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Full Name</p>
                            <p className="font-bold text-primary-950 uppercase">{profile?.full_name}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Matric No</p>
                            <p className="font-bold text-primary-950 uppercase">{studentData?.student_info?.reg_no || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
                            <p className="font-bold text-primary-950 break-all">{profile?.email}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Current Level</p>
                            <p className="font-bold text-primary-950 uppercase">{studentData?.student_info?.level ? `${studentData.student_info.level} Level` : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Academic Info */}
            <div className="lg:col-span-2 space-y-8">
                {/* Upper Info Grid */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">College</p>
                        <p className="font-bold text-primary-950 text-sm">{studentData?.student_info?.college || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Department</p>
                        <p className="font-bold text-primary-950 text-sm">{studentData?.student_info?.department || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Session</p>
                        <p className="font-bold text-primary-950 text-sm">{studentData?.current_session?.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Status</p>
                        <p className="font-bold text-primary-950 text-sm uppercase">{studentData?.student_info?.status || 'N/A'}</p>
                    </div>
                </div>

                {/* Welcome & Info */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-black italic text-primary-950 mb-2">
                            Hi <span className="uppercase">{profile?.full_name}</span>,
                        </h2>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            Welcome to your Student Portal! Your academic journey begins here. Navigate through your courses, payments, registration, and access other valuable resources. Embrace the possibilities. Happy learning!
                        </p>
                    </div>

                    <div className="academic-card overflow-hidden">
                        <div className="bg-primary-950 px-6 py-4 border-b border-primary-900">
                            <h3 className="text-white font-black uppercase tracking-widest text-sm">Academic Summary</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 hover:bg-gray-50 transition-colors">
                                <p className="text-xs font-bold text-gray-600">Total Courses Enrolled</p>
                                <p className="text-xs font-bold text-primary-950">{studentData?.academic_summary?.total_courses_enrolled || 0}</p>
                            </div>
                            <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 hover:bg-gray-50 transition-colors">
                                <p className="text-xs font-bold text-gray-600">Active Courses</p>
                                <p className="text-xs font-bold text-primary-950">{studentData?.academic_summary?.active_courses || 0}</p>
                            </div>
                            <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 hover:bg-gray-50 transition-colors">
                                <p className="text-xs font-bold text-gray-600">Completed Courses</p>
                                <p className="text-xs font-bold text-primary-950">{studentData?.academic_summary?.completed_courses || 0}</p>
                            </div>
                            <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 hover:bg-gray-50 transition-colors">
                                <p className="text-xs font-bold text-gray-600">Total Amount Paid</p>
                                <p className="text-xs font-bold text-primary-950">₦{(studentData?.payment_status?.total_paid || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 sm:p-6 grid grid-cols-2 gap-4 hover:bg-gray-50 transition-colors">
                                <p className="text-xs font-bold text-gray-600">Pending Payments</p>
                                <span className={`inline-flex w-fit items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${(studentData?.payment_status?.pending_count || 0) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {studentData?.payment_status?.pending_count || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

StudentDashboard.propTypes = {
    profile: PropTypes.object.isRequired,
    studentData: PropTypes.object
};

export default StudentDashboard;
