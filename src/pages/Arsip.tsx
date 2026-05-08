import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, FileText, Camera, Trophy, Calendar, Download, Eye, ExternalLink, ChevronRight, X, FileCheck, Info, Loader2, Check, Plus, Upload, History, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import React, { useState, useMemo, useEffect } from 'react';
import { ARCHIVE_DATA } from '../data/mockData';
import { getArchives, ArchiveItem, logDownload, getDownloadLogs, DownloadLog, getCategories, Category } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';
import { db, storage, OperationType, handleFirestoreError } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const Arsip = () => {
  const { t } = useTranslation();
  const { isAdmin, user } = useAuth();
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogsLoading, setIsLogsLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeYear, setActiveYear] = useState('Semua');
  const [activeType, setActiveType] = useState('Semua');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    description: '',
    tags: ''
  });
  const [itemToConfirm, setItemToConfirm] = useState<any>(null);
  const [downloadQueue, setDownloadQueue] = useState<{ id: string; title: string; progress: number; status: 'downloading' | 'completed' | 'error'; error?: string }[]>([]);
  const [downloadingItems, setDownloadingItems] = useState<Record<string, number>>({});
  const [downloadSuccess, setDownloadSuccess] = useState<Record<string, boolean>>({});
  
  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [newArchive, setNewArchive] = useState({
    title: '',
    category: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    const unsubscribeArchives = getArchives((data) => {
      setArchives(data);
      setIsLoading(false);
    });

    const unsubscribeCategories = getCategories((data) => {
      setCategoriesList(data);
      if (data.length > 0) {
        if (!newArchive.category) setNewArchive(prev => ({ ...prev, category: data[0].name }));
        if (!editForm.category) setEditForm(prev => ({ ...prev, category: data[0].name }));
      }
    });

    let unsubscribeLogs: (() => void) | undefined;
    if (isAdmin) {
      unsubscribeLogs = getDownloadLogs((data) => {
        setDownloadLogs(data);
        setIsLogsLoading(false);
      });
    }

    return () => {
      unsubscribeArchives();
      unsubscribeCategories();
      if (unsubscribeLogs) unsubscribeLogs();
    };
  }, [isAdmin]);

  const displayData = useMemo(() => {
    // Merge mock data with fetched data for demo if empty, or just show fetched
    if (archives.length === 0 && !isLoading) {
      // In a real scenario, we might want to seed the database with mock data once
      return ARCHIVE_DATA;
    }
    return archives;
  }, [archives, isLoading]);

  const categories = useMemo(() => {
    const fromDB = categoriesList.map(c => c.name);
    // If empty, show some defaults or just "Semua"
    if (fromDB.length === 0) return ['Semua', 'Dokumen', 'Kegiatan', 'Prestasi', 'Event'];
    return ['Semua', ...fromDB];
  }, [categoriesList]);

  const years = ['Semua', '2024', '2023', '2022', '2021'];
  const fileTypes = ['Semua', 'pdf', 'image', 'video', 'file'];

  const parseFilesize = (sizeStr: string): number => {
    if (!sizeStr) return 0;
    const [num, unit] = sizeStr.split(' ');
    const value = parseFloat(num);
    if (unit === 'GB') return value * 1024;
    if (unit === 'KB') return value / 1024;
    return value; // Default to MB
  };

  const filteredData = useMemo(() => {
    return displayData.filter((item: any) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(searchTermLower) || 
                           (item.description && item.description.toLowerCase().includes(searchTermLower)) ||
                           (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchTermLower)));
      const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
      const yearStr = item.date ? item.date.split('-')[2] || item.date.split(' ').pop() : '';
      const matchesYear = activeYear === 'Semua' || yearStr.includes(activeYear);
      const matchesType = activeType === 'Semua' || item.type === activeType;
      return matchesSearch && matchesCategory && matchesYear && matchesType;
    });
  }, [displayData, searchTerm, activeCategory, activeYear, activeType]);

  const getIcon = (type: string, size = 20) => {
    switch(type) {
      case 'pdf': return <FileText size={size} className="text-red-500" />;
      case 'image': return <Camera size={size} className="text-blue-500" />;
      case 'video': return <ExternalLink size={size} className="text-purple-500" />;
      default: return <FileText size={size} />;
    }
  };

  const updateDownloadProgress = (id: string, progress: number, status: 'downloading' | 'completed' | 'error' = 'downloading', error?: string, title?: string) => {
    setDownloadingItems(prev => ({ ...prev, [id]: progress }));
    
    setDownloadQueue(prev => {
      const existing = prev.find(d => d.id === id);
      if (existing) {
        return prev.map(d => d.id === id ? { ...d, progress, status, error: error || d.error } : d);
      }
      return [...prev, { id, title: title || 'File', progress, status, error }];
    });

    if (status === 'completed') {
      setDownloadSuccess(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setDownloadingItems(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 3000);
    }
  };

  const startDownload = async (item: any) => {
    if (downloadQueue.some(d => d.id === item.id && d.status === 'downloading')) return;

    // Log the download session
    logDownload(item, user);

    updateDownloadProgress(item.id, 0, 'downloading', undefined, item.title);

    if (item.fileUrl && item.fileUrl !== '#') {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', item.fileUrl, true);
        xhr.responseType = 'blob';

        xhr.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            updateDownloadProgress(item.id, percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const blob = xhr.response;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = item.title + (item.type ? `.${item.type}` : '');
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            updateDownloadProgress(item.id, 100, 'completed');
          } else {
            updateDownloadProgress(item.id, 0, 'error', `HTTP ${xhr.status}`);
          }
        };

        xhr.onerror = () => {
          updateDownloadProgress(item.id, 0, 'error', 'Network Connection Failed');
        };

        xhr.send();
      } catch (error) {
        console.error('Download error:', error);
        updateDownloadProgress(item.id, 0, 'error', error instanceof Error ? error.message : 'Unknown Error');
      }
    } else {
      // Fallback for items without real URLs (robust simulation)
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          updateDownloadProgress(item.id, 100, 'completed');
        } else {
          updateDownloadProgress(item.id, progress);
        }
      }, 300);
    }
  };

  const handleDownload = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (downloadingItems[item.id] !== undefined) return;
    
    // For large files, we show confirmation
    const size = parseFilesize(item.filesize);
    if (size > 10) { // Increased threshold to 10MB
      setItemToConfirm(item);
    } else {
      startDownload(item);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !newArchive.title || !user) return;
    
    setIsUploading(true);
    const fileName = `${Date.now()}_${uploadFile.name}`;
    const storageRef = ref(storage, `archives/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, uploadFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Upload error:", error);
        setIsUploading(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
        
        try {
          await addDoc(collection(db, 'archives'), {
            title: newArchive.title,
            category: newArchive.category,
            description: newArchive.description,
            tags: newArchive.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            date: dateStr,
            filesize: `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB`,
            type: uploadFile.name.split('.').pop()?.toLowerCase() || 'file',
            fileUrl: downloadURL,
            uploaderId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          setIsUploadModalOpen(false);
          setUploadFile(null);
          setNewArchive({ title: '', category: categoriesList[0]?.name || '', description: '', tags: '' });
          setUploadProgress(0);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'archives');
        } finally {
          setIsUploading(false);
        }
      }
    );
  };

  const handleUpdateArchive = async () => {
    if (!selectedItem || !editForm.title || !user) return;
    
    setIsUploading(true);
    try {
      const archiveRef = doc(db, 'archives', selectedItem.id);
      await updateDoc(archiveRef, {
        title: editForm.title,
        category: editForm.category,
        description: editForm.description,
        tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        updatedAt: serverTimestamp()
      });
      
      setSelectedItem(null);
      setIsEditing(false);
      setEditForm({ title: '', category: categoriesList[0]?.name || '', description: '', tags: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `archives/${selectedItem.id}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (item: any) => {
    setEditForm({
      title: item.title,
      category: item.category,
      description: item.description || '',
      tags: item.tags ? item.tags.join(', ') : ''
    });
    setIsEditing(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Hapus arsip ini selamanya?')) return;
    try {
      await deleteDoc(doc(db, 'archives', id));
      setSelectedItem(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `archives/${id}`);
    }
  };

  return (
    <div className="bg-gray-50 pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 text-primary font-bold text-sm mb-4">
              <span>{t('archive.breadcrumb')}</span>
              <ChevronRight size={14} />
              <span className="text-secondary/50 uppercase tracking-widest">{t('archive.subtitle')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-4">{t('archive.title')}</h1>
            <p className="text-secondary/60 max-w-2xl leading-relaxed">
              {t('archive.description')}
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 italic ${
                  showLogs ? 'bg-secondary text-white' : 'bg-white text-secondary border border-gray-100 hover:border-primary/30'
                }`}
              >
                <History size={16} /> {showLogs ? t('archive.historyBtnClose') : t('archive.historyBtn')}
              </button>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                aria-label={t('archive.addBtn')}
                className="gradient-primary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95 italic"
              >
                <Plus size={16} /> {t('archive.addBtn')}
              </button>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-8 md:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t('archive.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label={t('archive.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-secondary text-sm focus:ring-1 focus:ring-primary transition-all shadow-inner italic"
              />
            </div>

            {/* Category Filter - Mobile Horizontal Scroll */}
            <div className="lg:col-span-4 flex overflow-x-auto pb-1 -mx-2 px-2 lg:mx-0 lg:px-0 lg:pb-0 lg:flex-wrap gap-1.5 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  aria-label={`${t('archive.filterByCategory')}: ${cat === 'Semua' ? t('archive.allCategories') : cat}`}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all italic flex-shrink-0 ${
                    activeCategory === cat 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-gray-50 text-secondary/40 hover:bg-gray-100'
                  }`}
                >
                  {cat === 'Semua' ? t('archive.allCategories') : cat}
                </button>
              ))}
            </div>

            {/* Year Filter */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <Filter size={16} className="text-primary shrink-0" />
              <select 
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
                className="flex-grow bg-gray-50 border-none rounded-lg py-2 px-3 text-[10px] font-black uppercase tracking-widest text-secondary focus:ring-1 focus:ring-primary italic"
              >
                {years.map(y => <option key={y} value={y}>{y === 'Semua' ? t('archive.allYears') : `${t('archive.yearPrefix')} ${y}`}</option>)}
              </select>
            </div>

            {/* Type Filter */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <FileCheck size={16} className="text-primary shrink-0" />
              <select 
                value={activeType}
                onChange={(e) => setActiveType(e.target.value)}
                className="flex-grow bg-gray-50 border-none rounded-lg py-2 px-3 text-[10px] font-black uppercase tracking-widest text-secondary focus:ring-1 focus:ring-primary italic"
              >
                {fileTypes.map(type => <option key={type} value={type}>{type === 'Semua' ? t('archive.formatPlaceholder') : `${type.toUpperCase()}`}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6 px-2">
          <p className="text-[10px] text-secondary/40 font-black uppercase tracking-widest italic">
            {t('archive.foundLabel')}: <span className="text-primary">{filteredData.length} {t('archive.archivesLabel')}</span>
          </p>
        </div>

        {/* Logs View */}
        <AnimatePresence>
          {showLogs && isAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-sm font-black uppercase tracking-widest text-secondary italic">{t('archive.historyTitle')}</h3>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase italic">
                    {downloadLogs.length} {t('archive.historyTotal')}
                  </span>
                </div>
                <div className="overflow-x-auto text-secondary">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary/40 italic">{t('archive.historyArchive')}</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary/40 italic">{t('archive.historyUser')}</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary/40 italic">{t('archive.historyTime')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {isLogsLoading ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-secondary/20 italic text-xs">{t('archive.historyLoading')}</td>
                        </tr>
                      ) : downloadLogs.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-secondary/20 italic text-xs">{t('archive.historyEmpty')}</td>
                        </tr>
                      ) : (
                        downloadLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-xs font-bold italic">{log.archiveTitle}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-[11px] font-bold italic">{log.userName}</div>
                              <div className="text-[9px] opacity-40 italic">{log.userEmail}</div>
                            </td>
                            <td className="px-6 py-4 text-[10px] font-bold opacity-50 italic">
                              {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString(t('archive.historyDateLocale')) : 'Sesaat yang lalu'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Archive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {filteredData.length > 0 ? (
            filteredData.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative group"
              >
                {/* Abstract decorative layers */}
                <motion.div 
                  animate={{ 
                    rotate: [-1, -2, -1],
                    scale: [0.99, 1.01, 0.99],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-primary/10 rounded-[1rem] translate-x-1.5 translate-y-1.5 -z-10 blur-[2px] group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" 
                />
                <motion.div 
                  animate={{ 
                    rotate: [1, 2, 1],
                    scale: [0.99, 1.02, 0.99],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute inset-0 bg-accent/20 rounded-[1rem] -translate-x-1 translate-y-1 -z-10 blur-[2px] group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform" 
                />

                <div
                  onClick={() => setSelectedItem(item)}
                  role="button"
                  aria-label={`${t('archive.detailsTitle')}: ${item.title}`}
                  className="bg-white rounded-[1rem] p-3 md:p-4 border border-gray-100 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer h-full relative"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors shrink-0">
                      {getIcon(item.type, 14)}
                    </div>
                    <div className="flex gap-2 items-center overflow-hidden">
                      {isAdmin && (
                        <button 
                          onClick={(e) => handleDelete(e, item.id)}
                          aria-label={`${t('archive.deleteBtn')} ${item.title}`}
                          className="p-1 text-red-500/30 hover:text-red-500 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      )}
                      <span className="bg-soft-bg/80 text-secondary px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter italic truncate">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs md:text-sm font-bold text-secondary mb-1 group-hover:text-primary transition-colors leading-tight italic truncate">
                     {item.title}
                  </h3>
                  
                  <p className="text-secondary/50 text-[9px] md:text-[10px] mb-3 flex-grow leading-relaxed line-clamp-2 italic">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-50 text-secondary/30 text-[7px] font-black rounded-sm uppercase tracking-tighter italic">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-[7px] font-black uppercase text-secondary/30 tracking-widest italic">
                      {item.date}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        className="p-0.5 text-secondary/30 hover:text-primary transition-colors"
                        aria-label={`${t('archive.viewBtn')} ${item.title}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                      >
                        <Eye size={12} />
                      </button>
                      <button 
                        className={`p-0.5 transition-all outline-none ${downloadingItems[item.id] !== undefined ? 'text-primary' : downloadSuccess[item.id] ? 'text-green-500' : 'text-primary/40 hover:scale-110'}`}
                        aria-label={`${t('archive.detailsDownload')} ${item.title}`}
                        onClick={(e) => handleDownload(e, item)}
                        disabled={downloadingItems[item.id] !== undefined || downloadSuccess[item.id]}
                      >
                        {downloadSuccess[item.id] ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={12} /></motion.div>
                        ) : downloadingItems[item.id] !== undefined ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Download size={12} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Local Progress Bar */}
                  {downloadingItems[item.id] !== undefined && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50 overflow-hidden rounded-b-full">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadingItems[item.id]}%` }}
                        transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  )}
                  {downloadSuccess[item.id] && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-b-full" />
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full text-gray-400 mb-6 italic">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-2">{t('archive.emptyTitle')}</h3>
              <p className="text-secondary/40">{t('archive.emptyDescription')}</p>
              <button 
                onClick={() => {setSearchTerm(''); setActiveCategory('Semua'); setActiveYear('Semua'); setActiveType('Semua');}}
                className="mt-8 text-primary font-bold underline underline-offset-8"
              >
                {t('archive.emptyReset')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-secondary/90 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh] md:max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => { setSelectedItem(null); setIsEditing(false); }}
                className="absolute top-4 right-4 z-20 p-2 bg-secondary/10 hover:bg-white text-secondary hover:text-primary rounded-full backdrop-blur-md transition-all shadow-sm"
              >
                <X size={20} />
              </button>

              {/* Preview Area */}
              <div className="w-full md:w-[40%] bg-gray-100 flex items-center justify-center relative overflow-hidden min-h-[200px] md:min-h-full">
                {selectedItem.type === 'image' ? (
                  <img 
                    src={selectedItem.image || "https://github.com/ikosiswono/infosdn1gabuskulon/blob/main/assets/gambar/sekolah/bangunan%20sekolah.png?raw=true"} 
                    alt={selectedItem.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center text-secondary/20">
                      {getIcon(selectedItem.type, 40)}
                    </div>
                    <div>
                      <h4 className="text-secondary font-display font-bold text-xs uppercase tracking-[0.2em]">{selectedItem.type} DOCUMENT</h4>
                    </div>
                  </div>
                )}
              </div>

              {/* Details Area */}
              <div className="w-full md:w-[60%] p-6 md:p-10 overflow-y-auto">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[9px] tracking-widest mb-6 italic">
                      <FileCheck size={10} /> {t('archive.modalEditMode')}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">{t('archive.modalFieldTitle')}</label>
                        <input 
                          type="text" 
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-primary italic font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">{t('archive.modalFieldCategory')}</label>
                          <select 
                            value={editForm.category}
                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-primary italic font-bold uppercase tracking-widest"
                          >
                            {categories.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">{t('archive.modalFieldTags')}</label>
                          <input 
                            type="text" 
                            value={editForm.tags}
                            onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-primary italic"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">{t('archive.modalFieldDescription')}</label>
                        <textarea 
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-primary italic resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <button 
                        onClick={handleUpdateArchive}
                        disabled={isUploading}
                        className="flex-grow py-3.5 gradient-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 italic"
                      >
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <>{t('archive.modalBtnSave')} <Check size={16} /></>}
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        disabled={isUploading}
                        className="px-6 py-3.5 bg-gray-50 text-secondary/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors italic"
                      >
                        {t('archive.modalBtnCancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-primary font-black uppercase text-[9px] tracking-widest italic">
                          <Info size={10} /> {t('archive.detailsTitle')}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditClick(selectedItem)}
                              className="p-2 bg-gray-50 text-secondary/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                              title="Edit Arsip"
                            >
                              <FileCheck size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, selectedItem.id)}
                              className="p-2 bg-gray-50 text-secondary/40 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all"
                              title="Hapus Arsip"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-display font-bold text-secondary mb-3 leading-tight italic">
                        {selectedItem.title}
                      </h2>
                      <div className="flex gap-2">
                        <span className="bg-primary/5 text-primary px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase italic">
                          {selectedItem.category}
                        </span>
                        <span className="bg-gray-50 text-secondary/30 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase italic">
                          {t('archive.detailsYear')} {selectedItem.year || selectedItem.date?.split('-')[2]}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6 mb-8 text-black">
                      <div className="space-y-2">
                        <h4 className="text-secondary/30 font-black uppercase text-[8px] tracking-widest italic">{t('archive.detailsDescription')}</h4>
                        <p className="text-secondary/70 text-xs leading-relaxed italic">
                          {selectedItem.description}
                        </p>
                      </div>

                      {selectedItem.tags && selectedItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedItem.tags.map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-50 text-secondary/40 text-[8px] font-black rounded-md uppercase tracking-tighter italic">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-1">
                            <h4 className="text-secondary/30 font-black uppercase text-[8px] tracking-widest italic">{t('archive.detailsFilesize')}</h4>
                            <p className="text-secondary font-bold text-xs italic">{selectedItem.filesize}</p>
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-secondary/30 font-black uppercase text-[8px] tracking-widest italic">{t('archive.detailsArchivedOn')}</h4>
                            <p className="text-secondary font-bold text-xs italic">{selectedItem.date}</p>
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={(e) => handleDownload(e, selectedItem)}
                        disabled={downloadingItems[selectedItem.id] !== undefined || downloadSuccess[selectedItem.id]}
                        className={`flex-grow py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all italic relative overflow-hidden ${
                          downloadSuccess[selectedItem.id] ? 'bg-green-500 text-white shadow-green-500/20' : 'gradient-primary text-white hover:shadow-primary/20'
                        }`}
                      >
                        {downloadSuccess[selectedItem.id] ? (
                          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-2">
                            <Check size={16} /> {t('archive.detailsDownloaded')}
                          </motion.div>
                        ) : downloadingItems[selectedItem.id] !== undefined ? (
                          <>
                            <div className="absolute inset-0 bg-primary/20">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${downloadingItems[selectedItem.id]}%` }}
                                transition={{ type: "spring", bounce: 0 }}
                                className="h-full bg-white/30"
                              />
                            </div>
                            <Loader2 size={16} className="animate-spin relative z-10" />
                            <span className="relative z-10">{t('archive.detailsDownloading')} {Math.round(downloadingItems[selectedItem.id])}%</span>
                          </>
                        ) : (
                          <>{t('archive.detailsDownload')} <Download size={16} /></>
                        )}
                      </button>
                      <button 
                        onClick={() => setSelectedItem(null)}
                        className="px-6 py-3.5 bg-gray-50 text-secondary/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors italic"
                      >
                        {t('archive.detailsClose')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Large Files */}
      <AnimatePresence>
        {itemToConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToConfirm(null)}
              className="absolute inset-0 bg-secondary/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Download size={32} />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2 italic">{t('archive.confirmTitle')}</h3>
              <p className="text-secondary/60 text-sm mb-8 italic">
                {t('archive.confirmDescription', { size: itemToConfirm.filesize })}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setItemToConfirm(null)}
                  className="py-3 bg-gray-50 text-secondary/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors italic"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    startDownload(itemToConfirm);
                    setItemToConfirm(null);
                  }}
                  className="py-3 gradient-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all italic"
                >
                  {t('archive.confirmYes')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUploading && setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-secondary/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-secondary italic uppercase tracking-widest">{t('archive.modalUploadTitle')}</h3>
                  <button onClick={() => !isUploading && setIsUploadModalOpen(false)} className="text-secondary/20 hover:text-red-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">{t('archive.modalFieldPhotoLabel') || 'Pilih File'}</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <div className="border-2 border-dashed border-gray-100 group-hover:border-primary/30 rounded-2xl p-8 text-center transition-all">
                        <Upload size={32} className="mx-auto text-primary/20 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-xs text-secondary/50 font-bold italic">
                          {uploadFile ? uploadFile.name : t('archive.modalUploadFiles')}
                        </p>
                        {uploadFile && (
                          <p className="text-[9px] text-primary font-black uppercase mt-2">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">{t('archive.modalFieldTitle')}</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Rapor Tahunan 2024"
                      value={newArchive.title}
                      onChange={(e) => setNewArchive(prev => ({ ...prev, title: e.target.value }))}
                      disabled={isUploading}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-primary italic"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">{t('archive.modalFieldCategory')}</label>
                      <select 
                        value={newArchive.category}
                        onChange={(e) => setNewArchive(prev => ({ ...prev, category: e.target.value }))}
                        disabled={isUploading}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-primary italic font-bold uppercase tracking-widest"
                      >
                        {categories.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">{t('archive.modalFieldTags')}</label>
                      <input 
                        type="text" 
                        placeholder="pdf, laporan, 2024"
                        value={newArchive.tags}
                        onChange={(e) => setNewArchive(prev => ({ ...prev, tags: e.target.value }))}
                        disabled={isUploading}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-primary italic"
                      />
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black text-primary uppercase tracking-widest italic">
                         <span>Mengunggah...</span>
                         <span>{Math.round(uploadProgress)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${uploadProgress}%` }}
                           className="h-full bg-primary"
                         />
                       </div>
                    </div>
                  )}

                  <button 
                    onClick={handleFileUpload}
                    disabled={isUploading || !uploadFile || !newArchive.title}
                    className="w-full gradient-primary text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 italic"
                  >
                    {t('archive.modalUploadBtn')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Download Manager UI */}
      <AnimatePresence>
        {downloadQueue.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-8 z-[200] w-80 max-w-[calc(100vw-2rem)]"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
               <div className="bg-secondary p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-white">
                    <Download size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Download Manager</span>
                  </div>
                  <button 
                    onClick={() => setDownloadQueue([])}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
               </div>
               <div className="max-h-60 overflow-y-auto p-4 space-y-4 no-scrollbar">
                  {downloadQueue.map((dl) => (
                    <div key={dl.id} className="space-y-2">
                       <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-secondary truncate italic flex-grow mr-2">{dl.title}</span>
                          <span className={`text-[9px] font-black uppercase italic ${
                            dl.status === 'completed' ? 'text-green-500' : 
                            dl.status === 'error' ? 'text-red-500' : 'text-primary'
                          }`}>
                            {dl.status === 'downloading' ? `${Math.round(dl.progress)}%` : dl.status === 'completed' ? 'Selesai' : 'Gagal'}
                          </span>
                       </div>
                       <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={false}
                            animate={{ 
                              width: `${dl.progress}%`,
                              backgroundColor: dl.status === 'completed' ? '#22c55e' : dl.status === 'error' ? '#ef4444' : '#6366f1'
                            }}
                            className="h-full"
                          />
                       </div>
                       {dl.error && (
                         <p className="text-[8px] text-red-500 font-bold italic uppercase tracking-tighter">{dl.error}</p>
                       )}
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Arsip;
