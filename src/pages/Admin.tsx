import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Lock, User, LogIn, ChevronRight, LayoutDashboard, FileUp, Settings, LogOut, History, FileText, BarChart2, PieChart as PieChartIcon, TrendingUp, Tags, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDownloadLogs, DownloadLog, getArchives, ArchiveItem, getCategories, Category } from '../services/firebaseService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { STAFF_DATA } from '../data/mockData';

const Admin = () => {
  const { t } = useTranslation();
  const { login, logout, user, isAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [recentLogs, setRecentLogs] = useState<DownloadLog[]>([]);
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isSeedingStaff, setIsSeedingStaff] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const unsubLogs = getDownloadLogs((data) => {
        setLogs(data);
        setRecentLogs(data.slice(0, 5));
      });
      const unsubArchives = getArchives((data) => {
        setArchives(data);
      });
      const unsubCategories = getCategories((data) => {
        setCategories(data);
        setLoading(false);
      });
      
      const unsubStaff = getDocs(collection(db, 'staff')).then(snap => {
        setStaffCount(snap.size);
      });

      return () => {
        unsubLogs();
        unsubArchives();
        unsubCategories();
      };
    }
  }, [isAdmin]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategory.trim(),
        createdAt: serverTimestamp()
      });
      setNewCategory('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'categories');
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;

    try {
      await updateDoc(doc(db, 'categories', editingCategory.id), {
        name: editCategoryName.trim()
      });
      setEditingCategory(null);
      setEditCategoryName('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${editingCategory.id}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t('admin.categoryDeleteConfirm'))) return;

    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  };

  const handleSeedStaff = async () => {
    if (!confirm('Anda yakin ingin mereset dan menginisialisasi ulang data Guru/Staff? Data staff saat ini akan dihapus.')) return;
    
    setIsSeedingStaff(true);
    try {
      // 1. Delete existing staff
      const staffRef = collection(db, 'staff');
      const staffSnap = await getDocs(staffRef);
      
      const batch = writeBatch(db);
      staffSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // 2. Add new staff from STAFF_DATA
      for (const member of STAFF_DATA) {
        await addDoc(collection(db, 'staff'), {
          name: member.name,
          role: member.role,
          edu: member.edu,
          nip: member.nip,
          ttl: member.ttl,
          gol: member.gol,
          img: member.img,
          order: member.order,
          subject: member.subject || '-',
          email: member.email || '',
          bio: member.bio || '',
          achievements: member.achievements || [],
          createdAt: serverTimestamp()
        });
      }
      
      alert('Data Guru/Staff berhasil diperbarui!');
    } catch (error) {
       console.error("Error seeding staff:", error);
       alert('Gagal memperbarui data staff.');
    } finally {
      setIsSeedingStaff(false);
    }
  };

  // Transform data for charts
  const chartData = useMemo(() => {
    if (logs.length === 0) return { daily: [], categories: [] };

    // 1. Daily trends (last 7 days)
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      days[dateStr] = 0;
    }

    logs.forEach(log => {
      if (!log.timestamp) return;
      const date = log.timestamp.toDate();
      const dateStr = date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      if (days[dateStr] !== undefined) {
        days[dateStr]++;
      }
    });

    const daily = Object.entries(days).map(([name, count]) => ({ name, count }));

    // 2. Category distribution
    // Note: logs don't have category directly, we might need to join with archives
    // Since we have archives list, we can map log.archiveId to archive.category
    const catCounts: Record<string, number> = {};
    logs.forEach(log => {
      const archive = archives.find(a => a.id === log.archiveId);
      const cat = archive?.category || 'Lainnya';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const categories = Object.entries(catCounts).map(([name, value]) => ({ name, value }));

    return { daily, categories };
  }, [logs, archives]);

  const COLORS = ['#FF6B00', '#2E2D2B', '#8B5CF6', '#10B981', '#3B82F6'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (error) {
      alert(t('admin.loginFailed'));
    }
  };

  if (!isAdmin) {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-secondary text-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-display font-bold text-secondary mb-2 italic">{t('admin.loginTitle')}</h1>
            <p className="text-secondary/50 text-sm italic">{t('admin.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="admin-username" className="text-[10px] font-black uppercase text-secondary/30 tracking-widest pl-2 italic">{t('admin.loginUserLabel')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  id="admin-username"
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="infosdn1gabuskulon" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm italic" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-[10px] font-black uppercase text-secondary/30 tracking-widest pl-2 italic">{t('admin.loginPassLabel')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  id="admin-password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm italic" 
                />
              </div>
            </div>

            <button type="submit" aria-label={t('admin.loginBtn')} className="w-full gradient-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/30 transition-all italic">
              {t('admin.loginBtn')} <LogIn size={20} />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-secondary/30 italic">
            {t('admin.loginForgot')}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 text-primary font-bold text-sm mb-2">
              <LayoutDashboard size={16} />
              <span className="uppercase tracking-widest">{t('admin.dashboardTitle')}</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-secondary italic text-black">{t('admin.welcome')}, {user?.displayName || 'Admin'}</h1>
          </div>
          <button 
            onClick={logout}
            aria-label={t('admin.logoutBtn')}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all italic"
          >
            {t('admin.logoutBtn')} <LogOut size={18} />
          </button>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-black">
          {/* Quick Stats */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
               <h3 className="text-xl font-display font-bold text-secondary mb-6 italic">{t('admin.statsTitle')}</h3>
               <div className="space-y-4">
                  {[
                    { label: t('admin.statsTotalArchive'), val: loading ? '...' : archives.length, color: 'text-primary' },
                    { label: t('admin.statsLogDownload'), val: loading ? '...' : logs.length, color: 'text-accent' },
                    { label: t('admin.statsActiveStaff'), val: staffCount.toString(), color: 'text-purple-500' },
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-none">
                       <span className="text-secondary/50 text-sm italic">{stat.label}</span>
                       <span className={`font-display font-bold ${stat.color}`}>{stat.val}</span>
                    </div>
                  ))}
               </div>
            </div>
 
            <div className="bg-secondary p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
               <h3 className="text-xl font-display font-bold mb-6 italic">{t('admin.quickAccessTitle')}</h3>
               <p className="text-white/60 text-xs mb-8 italic">{t('admin.quickAccessSubtitle')}</p>
               <div className="space-y-3">
                 <button className="w-full bg-accent text-secondary font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform italic uppercase">
                    {t('admin.quickAccessUpload')} <FileUp size={18} />
                 </button>
                 <button className="w-full bg-white/10 text-white font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/20 hover:scale-105 transition-transform italic uppercase">
                    {t('admin.quickAccessStaff')} <User size={18} />
                 </button>
               </div>
            </div>
          </div>
 
          {/* Action Center */}
          <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-2xl font-display font-bold text-secondary mb-10 italic">{t('admin.logTitle')}</h3>
            <div className="space-y-6">
               {recentLogs.length === 0 ? (
                 <p className="text-center py-10 text-secondary/30 italic">{t('admin.logEmpty')}</p>
               ) : (
                 recentLogs.map((log, i) => (
                   <div key={log.id} className="flex gap-6 items-start p-6 bg-gray-50 rounded-2xl hover:bg-primary/5 transition-all group">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                         <FileText size={20} />
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between mb-1">
                            <h4 className="font-bold text-secondary italic">{t('admin.logSuccess')}</h4>
                            <span className="text-[10px] text-secondary/30 font-black uppercase tracking-widest">
                              {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : 'Baru saja'}
                            </span>
                         </div>
                         <p className="text-sm text-secondary/50 italic">
                           {t('admin.logUserAction', { userName: log.userName, archiveTitle: log.archiveTitle })}
                         </p>
                      </div>
                   </div>
                 ))
               )}
               <button className="w-full py-4 text-center text-primary font-bold text-sm italic hover:underline underline-offset-8 flex items-center justify-center gap-2">
                   <History size={16} /> {t('admin.logViewAll')}
               </button>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-12 space-y-8">
           <div className="flex items-center gap-4 text-secondary">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <TrendingUp size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold italic">{t('admin.analyticsTitle')}</h2>
                <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest italic">{t('admin.analyticsSubtitle')}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Trend Chart */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="font-display font-bold text-secondary italic flex items-center gap-2">
                     <BarChart2 size={18} className="text-primary" /> {t('admin.analyticsTrendTitle')}
                   </h3>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.daily}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#A3A3A3'}}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#A3A3A3'}}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Pie Chart */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="font-display font-bold text-secondary italic flex items-center gap-2">
                     <PieChartIcon size={18} className="text-primary" /> {t('admin.analyticsDistTitle')}
                   </h3>
                </div>
                <div className="h-[300px] w-full flex items-center">
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.categories}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.categories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-4 pr-6">
                    {chartData.categories.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-[10px] font-black uppercase text-secondary/60 italic tracking-widest">{entry.name}</span>
                         </div>
                         <span className="text-sm font-bold text-secondary italic">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* Category Management Section */}
        <div className="mt-12 space-y-8">
           <div className="flex items-center gap-4 text-secondary">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <Tags size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold italic">{t('admin.categoryTitle')}</h2>
                <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest italic">{t('admin.categorySubtitle')}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add/Edit Category Form */}
              <div className="lg:col-span-1">
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="font-display font-bold text-secondary italic mb-6">
                      {editingCategory ? t('admin.categoryEditTitle') : t('admin.categoryAddTitle')}
                    </h3>
                    <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-secondary/30 tracking-widest pl-2 italic">{t('admin.categoryFieldName')}</label>
                          <input 
                            type="text" 
                            value={editingCategory ? editCategoryName : newCategory}
                            onChange={(e) => editingCategory ? setEditCategoryName(e.target.value) : setNewCategory(e.target.value)}
                            placeholder={t('admin.categoryFieldPlaceholder')}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm italic focus:ring-2 focus:ring-primary font-bold"
                          />
                       </div>
                       <div className="flex gap-2">
                          <button 
                            type="submit" 
                            className="flex-grow gradient-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg italic"
                          >
                            {editingCategory ? t('admin.categoryBtnSave') : t('admin.categoryBtnAdd')} <Plus size={16} />
                          </button>
                          {editingCategory && (
                            <button 
                              type="button"
                              onClick={() => { setEditingCategory(null); setEditCategoryName(''); }}
                              className="px-6 py-4 bg-gray-50 text-secondary/40 rounded-xl text-xs font-bold italic"
                            >
                              {t('admin.categoryBtnCancel')}
                            </button>
                          )}
                       </div>
                    </form>
                 </div>
              </div>

              {/* Categories List */}
              <div className="lg:col-span-2">
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="font-display font-bold text-secondary italic mb-6">{t('admin.categoryListTitle')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {categories.length === 0 ? (
                         <p className="col-span-full text-center py-10 text-secondary/30 italic">{t('admin.categoryListEmpty')}</p>
                       ) : (
                         categories.map((cat) => (
                           <div key={cat.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-primary/5 transition-all group">
                              <span className="font-bold text-secondary italic">{cat.name}</span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => { setEditingCategory(cat); setEditCategoryName(cat.name); }}
                                   aria-label={`${t('admin.categoryEditBtn')}: ${cat.name}`}
                                   className="p-2 bg-white text-secondary/40 hover:text-primary rounded-lg shadow-sm"
                                 >
                                   <Edit size={14} />
                                 </button>
                                 <button 
                                   onClick={() => handleDeleteCategory(cat.id)}
                                   aria-label={`${t('admin.categoryDeleteBtn')}: ${cat.name}`}
                                   className="p-2 bg-white text-secondary/40 hover:text-red-500 rounded-lg shadow-sm"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* System Maintenance Section */}
        <div className="mt-12 space-y-8">
           <div className="flex items-center gap-4 text-secondary">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <Settings size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold italic">Sistem & Pemeliharaan</h2>
                <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest italic">Konfigurasi tingkat lanjut</p>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <h3 className="font-display font-bold text-secondary italic mb-2">Inisialisasi Data Guru/Staff</h3>
                    <p className="text-sm text-secondary/50 italic max-w-xl">
                       Gunakan fitur ini untuk mereset data Guru/Staff di database dengan daftar yang Anda berikan (Ginanjar Afriyandau, dkk). 
                       <span className="text-red-500 font-bold"> Peringatan: Data staff saat ini akan terhapus secara permanen.</span>
                    </p>
                 </div>
                 <button 
                  onClick={handleSeedStaff}
                  disabled={isSeedingStaff}
                  className="px-8 py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-secondary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 italic shrink-0"
                 >
                   {isSeedingStaff ? 'Memproses...' : 'Inisialisasi Data Baru'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
