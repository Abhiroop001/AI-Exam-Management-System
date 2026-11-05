import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { LiveStudentSession, Exam } from '../types';
import { 
  HiOutlineArrowLeft, 
  HiOutlineRadio, 
  HiOutlineClock
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
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-8 font-sans">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-purple-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back to Exams</span>
        </Link>

        {exam && (
          <Link
            to={`/exam/${exam._id}/submissions`}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors shadow-sm"
          >
            View Submissions & AI Reports &rarr;
          </Link>
        )}
      </div>

      {/* Hero Exam Live Banner */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden bg-white/95">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span>LIVE TEST TAKER RADAR</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">{exam?.title || 'Live Exam Session'}</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Subject: <span className="font-bold text-slate-800">{exam?.subject}</span> &bull; Code:{' '}
              <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{exam?.code}</span> &bull; Duration:{' '}
              <span className="font-bold text-slate-800">{exam?.durationMinutes} Mins</span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass-card p-5 rounded-2xl border border-cyan-200 text-center min-w-[140px] bg-cyan-50/40 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">In Progress</span>
              <span className="text-4xl font-black text-cyan-700 font-mono">
                {activeSessions.length}
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-emerald-200 text-center min-w-[140px] bg-emerald-50/40 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">Completed</span>
              <span className="text-4xl font-black text-emerald-700 font-mono">
                {submittedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Takers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Currently Active Students</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-cyan-700 font-mono font-bold border border-slate-200">
              {activeSessions.length} Active
            </span>
          </h2>
          <span className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
            <HiOutlineClock className="w-4 h-4 text-slate-400" />
            <span>Heartbeat polling active every 4s</span>
          </span>
        </div>

        {isLoading ? (
          <div className="p-16 text-center glass-panel rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Pinging live sessions...</p>
          </div>
        ) : activeSessions.length === 0 ? (
          <div className="p-16 text-center glass-panel rounded-3xl border border-slate-200 bg-white shadow-sm">
            <HiOutlineRadio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No students are actively taking the test right now</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              When students scan the QR code or enter the test code on their portal, their live session will stream here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
                  className="glass-card p-6 rounded-3xl border border-cyan-200 bg-white shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{session.studentName}</h4>
                      <p className="text-xs text-slate-500">{session.studentEmail}</p>
                    </div>

                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-bold border border-cyan-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                      <span>LIVE</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center justify-between pt-3 border-t border-slate-100">
                    <span>Class: <strong className="text-slate-800">{session.className || 'N/A'}</strong></span>
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
