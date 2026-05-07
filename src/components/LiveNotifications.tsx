import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, User, FileText, X } from 'lucide-react';
import { getDownloadLogs, DownloadLog } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

export const LiveNotifications = () => {
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  
  useEffect(() => {
    // Only admins are allowed to list/read download logs per Firestore Rules
    if (!isAdmin) return;

    // We only want to show *new* logs that happen after the component mounts
    const mountTime = Date.now();
    
    const unsubscribe = getDownloadLogs((logs) => {
      const latestLogs = logs.filter(log => {
        const logTime = log.timestamp?.toMillis ? log.timestamp.toMillis() : Date.now();
        return logTime > mountTime - 5000; // Last 5 seconds
      });

      if (latestLogs.length > 0) {
        setNotifications(prev => {
          // Avoid duplicates
          const uniqueNewLogs = latestLogs.filter(nLog => !prev.some(p => p.id === nLog.id));
          const newBatch = [...uniqueNewLogs, ...prev].slice(0, 3);
          return newBatch;
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.slice(0, -1));
        }, 5000);
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="bg-secondary/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 min-w-[280px] max-w-sm pointer-events-auto"
          >
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0">
               <FileText size={20} />
            </div>
            <div className="flex-grow overflow-hidden">
               <p className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-1">Unduhan Baru</p>
               <p className="text-xs font-bold italic truncate">{notif.userName || 'Seseorang'} mengunduh {notif.archiveTitle}</p>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="text-white/20 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
