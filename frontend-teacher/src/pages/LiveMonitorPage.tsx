import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { LiveStudentSession, Exam } from '../types';
import { 
  HiOutlineArrowLeft, 
  HiOutlineRadio, 
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineSparkles
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

export const LiveMonitorPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [activeSessions, setActiveSessions] = useState<LiveStudentSession[]>([]);
  const [submittedCount, setSubmittedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!examId) return;
    try {
      const [examRes, liveRes] = await Promise.all([
        api.get(`/exams/${examId}`),
        api.get(`/submissions/live/${examId}`),
      ]);

      if (examRes.data.success) {
        setExam(examRes.data.exam);
      }
      if (liveRes.data.success) {
        setActiveSessions(liveRes.data.activeStudents || []);
        setSubmittedCount(liveRes.data.submittedCount || 0);
      }
    } catch (err) {
      console.error('Error fetching live data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [examId]);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10 font-sans">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-base font-bold text-slate-700 hover:text-purple-600 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          <span>Back to Exams Dashboard</span>
        </Link>

        {exam && (
          <Link
            to={`/exam/${exam._id}/submissions`}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors shadow-sm"
          >
            View Submissions & Diagnostic Reports &rarr;
          </Link>
        )}
      </div>

      {/* Hero Exam Live Banner */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden bg-white/95">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-black uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
              <span>LIVE STUDENT RADAR & PROCTORING</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">{exam?.title || 'Live Exam Session'}</h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Subject: <span className="font-bold text-slate-900">{exam?.subject}</span> &bull; Code:{' '}
              <span className="font-mono font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">{exam?.code}</span> &bull; Duration:{' '}
              <span className="font-bold text-slate-900">{exam?.durationMinutes} Mins</span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass-card p-6 rounded-3xl border border-cyan-200 text-center min-w-[160px] bg-cyan-50/40 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-black tracking-wider block mb-1">In Progress</span>
              <span className="text-5xl font-black text-cyan-700 font-mono">
                {activeSessions.length}
              </span>
              <span className="text-[10px] text-cyan-700 font-bold block mt-1">Active Rooms</span>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-emerald-200 text-center min-w-[160px] bg-emerald-50/40 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-black tracking-wider block mb-1">Turned In</span>
              <span className="text-5xl font-black text-emerald-700 font-mono">
                {submittedCount}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Takers List */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center space-x-3">
            <span>Currently Active Live Takers</span>
            <span className="text-xs px-3.5 py-1 rounded-full bg-cyan-50 text-cyan-800 font-mono font-bold border border-cyan-200">
              {activeSessions.length} Active Now
            </span>
          </h2>
          <span className="text-sm text-slate-500 flex items-center space-x-2 font-medium">
            <HiOutlineClock className="w-4 h-4 text-slate-400" />
            <span>Telemetry heartbeat stream active every 4 seconds</span>
          </span>
        </div>

        {isLoading ? (
          <div className="p-20 text-center glass-panel rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-base font-bold text-slate-600">Pinging live student sessions...</p>
          </div>
        ) : activeSessions.length === 0 ? (
          <div className="p-20 text-center glass-panel rounded-3xl border border-slate-200 bg-white shadow-sm">
            <HiOutlineRadio className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800">No students are actively taking the test right now</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 font-medium">
              When students scan the QR code or enter the test code on their portal, their live session card will stream here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeSessions.map((session) => {
              const joinedTime = new Date(session.joinedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-7 rounded-3xl border border-cyan-200 bg-white shadow-sm relative overflow-hidden hover:border-cyan-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{session.studentName}</h4>
                      <p className="text-xs text-slate-500 font-medium">{session.studentEmail}</p>
                    </div>

                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-black border border-cyan-200">
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                      <span>LIVE</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center justify-between pt-4 border-t border-slate-100 font-medium">
                    <span>Class: <strong className="text-slate-900 font-bold">{session.className || 'N/A'}</strong></span>
                    <span>Started: {joinedTime}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
