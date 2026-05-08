import { motion, AnimatePresence } from 'motion/react';
import { Target, Eye, Users, Award, ShieldCheck, ChevronRight, GraduationCap, Info, Map as MapIcon, Globe, Plus, X, Trash2, Edit2, Upload, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SCHOOL_INFO } from '../constants/schoolInfo';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStaff, StaffMember } from '../services/firebaseService';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { STAFF_DATA } from '../data/mockData';

const Profil = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Management State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Guru Kelas',
    nip: '',
    ttl: '',
    edu: '',
    gol: '',
    subject: '',
    email: '',
    bio: '',
    achievements: [] as string[],
    order: 0
  });

  const [achievementInput, setAchievementInput] = useState('');

  useEffect(() => {
    const unsubscribe = getStaff((data) => {
      // If Firestore is empty, fallback to STAFF_DATA from mockData
      if (data.length === 0) {
        // Map STAFF_DATA to match StaffMember type with temporary IDs
        const fallbackData = STAFF_DATA.map((item, index) => ({
          ...item,
          id: `default-${index}`,
        })) as StaffMember[];
        setStaffList(fallbackData);
      } else {
        setStaffList(data);
      }
      setLoading(false);
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.role) return;
    setIsUploading(true);

    let imageUrl = '';
    if (uploadFile) {
      const storageRef = ref(storage, `staff/${Date.now()}_${uploadFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, uploadFile);
      
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
          (error) => reject(error),
          async () => {
            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(true);
          }
        );
      });
    }

    try {
      await addDoc(collection(db, 'staff'), {
        ...newStaff,
        img: imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
        order: Number(newStaff.order) || staffList.length + 1
      });
      setIsModalOpen(false);
      setUploadFile(null);
      setNewStaff({ 
        name: '', 
        role: 'Guru Kelas', 
        nip: '', 
        ttl: '', 
        edu: '', 
        gol: '', 
        subject: '',
        email: '',
        bio: '',
        achievements: [],
        order: 0 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'staff');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Hapus staf ini?')) return;
    try {
      await deleteDoc(doc(db, 'staff', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `staff/${id}`);
    }
  };

  return (
    <div className="pt-28 pb-20 relative min-h-screen">
      {/* Stable Background Layer */}
      <div 
        className="fixed inset-0 -z-20 pointer-events-none"
        aria-hidden="true"
      >
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://github.com/ikosiswono/infosdn1gabuskulon/blob/main/assets/gambar/halaman%201/Background%20halaman%20profile.jpg?raw=true')` }}
        />
        {/* Background Overlay for Readability */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-12 md:mb-20 text-center max-w-3xl mx-auto px-2">
           <div className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-4 justify-center">
            <span>{t('profile.breadcrumb')}</span>
            <ChevronRight size={14} />
            <span className="text-secondary/50 uppercase tracking-widest">{t('profile.subtitle')}</span>
          </div>
          <h1 className="md:h-[123px] md:w-[741px] text-center md:leading-[123px] text-2xl md:text-[58px] font-bold font-sans text-secondary mb-6 italic md:mx-auto">{SCHOOL_INFO.name}</h1>
          <p className="text-base md:text-lg text-secondary/60 leading-relaxed italic border-l-4 border-accent pl-6 text-left">
            "{t('profile.introDescription')}"
          </p>
          
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-12 px-8 py-4 gradient-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 italic flex items-center gap-3 mx-auto"
            >
              <Plus size={20} /> {t('profile.staffAdd')}
            </button>
          )}
        </div>

        {/* Official Info Section */}
        <div className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <Info size={24} />
              </div>
              <h4 className="text-[10px] font-black uppercase text-secondary/30 tracking-widest mb-1 italic">{t('profile.npsnLabel')}</h4>
              <p className="text-xl font-display font-bold text-secondary">{SCHOOL_INFO.npsn}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4">
                <Award size={24} />
              </div>
              <h4 className="text-[10px] font-black uppercase text-secondary/30 tracking-widest mb-1 italic">{t('profile.accreditationLabel')}</h4>
              <p className="text-xl font-display font-bold text-secondary">{SCHOOL_INFO.accreditation}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-4">
                <Globe size={24} />
              </div>
              <h4 className="text-[10px] font-black uppercase text-secondary/30 tracking-widest mb-1 italic">{t('profile.statusLabel')}</h4>
              <p className="text-xl font-display font-bold text-secondary">{SCHOOL_INFO.status}</p>
            </div>
          </div>
        </div>

        {/* History / Intro Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-soft-bg rounded-3xl -z-10 animate-pulse"></div>
              <img 
                src="https://github.com/ikosiswono/infosdn1gabuskulon/blob/main/assets/gambar/sekolah/bangunan%20sekolah.png?raw=true" 
                alt="School Building" 
                className="rounded-[3rem] shadow-2xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-[2rem] shadow-xl max-w-xs md:block hidden animate-bounce-slow">
                 <h4 className="font-display font-bold text-secondary text-lg mb-2">{t('profile.govLabel')}</h4>
                 <p className="text-sm text-secondary/50 italic leading-relaxed">{t('profile.foundationSkLabel')}: {SCHOOL_INFO.foundationSk}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-display font-bold text-secondary mb-8">{t('profile.historyTitle')}</h2>
            <div className="space-y-6 text-secondary/70 leading-relaxed">
              <p>
                {t('profile.historyText1')}
              </p>
              <p>
                {t('profile.historyText2')}
              </p>
              <div className="pt-6 grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-3xl font-display font-bold text-primary mb-1">1985</h4>
                  <p className="text-xs uppercase font-bold text-secondary/40 tracking-widest">{t('profile.statsFounded')}</p>
                </div>
                <div>
                  <h4 className="text-3xl font-display font-bold text-primary mb-1">2.400+</h4>
                  <p className="text-xs uppercase font-bold text-secondary/40 tracking-widest">{t('profile.statsAlumni')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Visi Misi */}
        <div className="bg-secondary rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 text-white mb-20 md:mb-32 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5">
              <ShieldCheck size={300} />
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 relative z-10">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-accent rounded-2xl flex items-center justify-center text-secondary mb-6 md:mb-8 shadow-lg shadow-accent/20">
                    <Eye size={36} />
                 </div>
                 <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 italic">{t('profile.visiTitle')}</h2>
                 <p className="text-xl md:text-2xl font-display text-white/90 leading-tight italic">
                    {t('profile.visiText')}
                 </p>
              </motion.div>


              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-6 md:mb-8 shadow-lg shadow-primary/20">
                    <Target size={36} />
                 </div>
                 <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 italic">{t('profile.misiTitle')}</h2>
                 <ul className="space-y-4 md:space-y-6 text-white/70">
                    {(t('profile.misiList', { returnObjects: true }) as string[]).map((misi, i) => (
                       <li key={i} className="flex gap-4 items-start group">
                          <span className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] md:text-xs font-black shrink-0 group-hover:bg-accent group-hover:text-secondary group-hover:border-accent transition-all uppercase italic">0{i+1}</span>
                          <p className="text-base md:text-lg leading-relaxed">{misi}</p>
                       </li>
                    ))}
                 </ul>
              </motion.div>
           </div>
        </div>

        {/* Struktur Organisasi Dummy */}
        <div className="mt-20 md:mt-40">
           <div className="text-center mb-12 md:mb-24 px-2">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-black tracking-[0.4em] uppercase text-[11px] mb-4 block italic"
              >
                {t('profile.staffSubtitle')}
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-7xl font-display font-black text-secondary italic tracking-tight"
              >
                {t('profile.staffTitle')}
              </motion.h2>
              <div className="w-24 h-1 bg-primary mx-auto mt-4 md:mt-8 rounded-full"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {loading ? (
                 <div className="col-span-full py-20 text-center text-secondary/30 italic uppercase tracking-widest text-xs font-black">
                   {t('profile.staffLoading')}
                 </div>
              ) : staffList.length === 0 ? (
                 <div className="col-span-full py-20 text-center text-secondary/30 italic uppercase tracking-widest text-xs font-black">
                   {t('profile.staffEmpty')}
                 </div>
              ) : (
                 staffList.map((staff, i) => (
                  <motion.div 
                     key={staff.id || i} 
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.05 }}
                     className="relative group"
                  >
                     {/* Abstract decorative layers */}
                     <motion.div 
                        animate={{ 
                          rotate: [-2, -3, -2],
                          scale: [0.98, 1.01, 0.98],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-primary/20 rounded-[2.5rem] md:rounded-[3rem] translate-x-3 translate-y-3 -z-10 blur-sm group-hover:translate-x-5 group-hover:translate-y-5 transition-transform" 
                     />
                     <motion.div 
                        animate={{ 
                          rotate: [2, 3, 2],
                          scale: [0.98, 1.02, 0.98],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute inset-0 bg-accent/30 rounded-[2.5rem] md:rounded-[3rem] -translate-x-2 translate-y-2 -z-10 blur-sm group-hover:-translate-x-4 group-hover:translate-y-4 transition-transform" 
                     />

                     <motion.div 
                        whileHover={{ y: -10 }}
                        onClick={() => setSelectedStaff(staff)}
                        className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all flex flex-col items-center relative overflow-hidden cursor-pointer h-full"
                     >
                        {isAdmin && (
                           <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleDeleteStaff(staff.id); }}
                               className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                        )}

                        <div className="relative mb-8 pt-4">
                           <div className="absolute inset-0 bg-primary/10 rounded-full scale-110 blur-2xl group-hover:bg-primary/20 transition-all"></div>
                           <div className="w-32 h-32 rounded-full overflow-hidden relative border-4 border-white group-hover:border-primary transition-all shrink-0 shadow-lg">
                              <img src={staff.img} alt={staff.name} className="w-full h-full object-cover" />
                           </div>
                        </div>
                        
                        <div className="text-center mb-8">
                          <h3 className="font-display font-black text-secondary text-lg mb-2 italic leading-tight group-hover:text-primary transition-colors">{staff.name}</h3>
                          <span className="inline-block px-4 py-2 bg-secondary/5 text-secondary font-black text-[10px] uppercase tracking-[0.2em] rounded-xl italic">{staff.role}</span>
                        </div>
    
                        <div className="w-full space-y-4 pt-8 border-t border-gray-100">
                          {staff.nip && (
                            <div>
                              <p className="text-[8px] font-black uppercase text-secondary/30 tracking-widest italic leading-none mb-1">NIP</p>
                              <p className="text-[11px] font-bold text-secondary italic">{staff.nip}</p>
                            </div>
                          )}
                          {staff.ttl && (
                           <div>
                             <p className="text-[8px] font-black uppercase text-secondary/30 tracking-widest italic leading-none mb-1">TTL</p>
                             <p className="text-[11px] font-bold text-secondary italic">{staff.ttl}</p>
                           </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            {staff.edu && (
                             <div>
                               <p className="text-[8px] font-black uppercase text-secondary/30 tracking-widest italic leading-none mb-1">Pendidikan</p>
                               <p className="text-[11px] font-bold text-secondary italic">{staff.edu}</p>
                             </div>
                            )}
                            {staff.gol && (
                              <div>
                                <p className="text-[8px] font-black uppercase text-secondary/30 tracking-widest italic leading-none mb-1">Golongan</p>
                                <p className="text-[11px] font-bold text-secondary italic">{staff.gol}</p>
                              </div>
                            )}
                          </div>
                        </div>
                     </motion.div>
                  </motion.div>
                ))
              )}
           </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUploading && setIsModalOpen(false)}
              className="absolute inset-0 bg-secondary/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-display font-bold text-secondary italic uppercase tracking-widest">Registrasi Staff Baru</h3>
                  <button onClick={() => !isUploading && setIsModalOpen(false)} className="text-secondary/20 hover:text-red-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Pilih Foto Profil</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          disabled={isUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        <div className="aspect-square border-2 border-dashed border-gray-100 group-hover:border-primary/30 rounded-3xl flex flex-col items-center justify-center p-6 text-center transition-all bg-gray-50/50">
                           {uploadFile ? (
                              <div className="text-secondary font-bold italic text-xs break-all px-4">{uploadFile.name}</div>
                           ) : (
                              <>
                                <Upload size={32} className="text-primary/20 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] text-secondary/40 font-bold italic px-4 uppercase tracking-widest">800x800px disarankan</p>
                              </>
                           )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Urutan Tampilan</label>
                      <input 
                        type="number" 
                        value={newStaff.order}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, order: Number(e.target.value) }))}
                        disabled={isUploading}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary font-bold italic"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Nama Lengkap & Gelar</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Nama, S.Pd."
                        value={newStaff.name}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isUploading}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary italic"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Jabatan</label>
                        <input 
                          type="text" 
                          value={newStaff.role}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                          disabled={isUploading}
                          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary italic"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">NIP</label>
                        <input 
                          type="text" 
                          value={newStaff.nip}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, nip: e.target.value }))}
                          disabled={isUploading}
                          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary italic"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Tempat, Tanggal Lahir</label>
                      <input 
                        type="text" 
                        value={newStaff.ttl}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, ttl: e.target.value }))}
                        disabled={isUploading}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary italic"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Pendidikan</label>
                        <input 
                          type="text" 
                          placeholder="S1 PGSD"
                          value={newStaff.edu}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, edu: e.target.value }))}
                          disabled={isUploading}
                          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary italic"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Mata Pelajaran</label>
                        <input 
                          type="text" 
                          value={newStaff.subject}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, subject: e.target.value }))}
                          disabled={isUploading}
                          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary italic"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Golongan</label>
                        <input 
                          type="text" 
                          value={newStaff.gol}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, gol: e.target.value }))}
                          disabled={isUploading}
                          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary italic"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Email Sekolah</label>
                        <input 
                          type="email" 
                          value={newStaff.email}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                          disabled={isUploading}
                          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary italic"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Riwayat Singkat (Bio)</label>
                      <textarea 
                        value={newStaff.bio}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={isUploading}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary italic resize-none"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2 block italic">Prestasi (Pisahkan Enter)</label>
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={achievementInput}
                          onChange={(e) => setAchievementInput(e.target.value)}
                          disabled={isUploading}
                          className="flex-grow px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary italic"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (achievementInput.trim()) {
                                setNewStaff(prev => ({ ...prev, achievements: [...prev.achievements, achievementInput.trim()] }));
                                setAchievementInput('');
                              }
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            if (achievementInput.trim()) {
                              setNewStaff(prev => ({ ...prev, achievements: [...prev.achievements, achievementInput.trim()] }));
                              setAchievementInput('');
                            }
                          }}
                          className="p-4 bg-primary text-white rounded-2xl"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newStaff.achievements.map((ach, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-lg flex items-center gap-2">
                            {ach}
                            <button onClick={() => setNewStaff(prev => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== idx) }))}>
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="mt-8 space-y-2">
                     <div className="flex justify-between text-[10px] font-black text-primary uppercase tracking-widest italic">
                       <span>Sinkronisasi Data...</span>
                       <span>{Math.round(uploadProgress)}%</span>
                     </div>
                     <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${uploadProgress}%` }}
                         className="h-full bg-primary shadow-[0_0_10px_rgba(255,107,0,0.5)]"
                       />
                     </div>
                  </div>
                )}

                <button 
                  onClick={handleAddStaff}
                  disabled={isUploading || !newStaff.name}
                  className="w-full mt-10 gradient-primary text-white py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 italic"
                >
                  {isUploading ? <Loader2 size={24} className="animate-spin mx-auto" /> : 'Simpan Data Ke Cloud'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Staff Detail Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStaff(null)}
              className="absolute inset-0 bg-secondary/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedStaff(null)}
                className="absolute top-8 right-8 z-20 p-2 bg-white/20 hover:bg-white/40 text-secondary rounded-full backdrop-blur-md transition-all md:text-white"
              >
                <X size={24} />
              </button>

              <div className="md:w-2/5 relative h-80 md:h-auto">
                 <img src={selectedStaff.img} alt={selectedStaff.name} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent opacity-60"></div>
                 <div className="absolute bottom-10 left-10 text-white">
                    <span className="inline-block px-3 py-1 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-lg mb-4 italic">{selectedStaff.role}</span>
                    <h3 className="text-3xl font-display font-black italic leading-tight">{selectedStaff.name}</h3>
                 </div>
              </div>

              <div className="md:w-3/5 p-12 overflow-y-auto max-h-[80vh]">
                 <div className="mb-12">
                   <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-4 italic">Profil & Biografi</h4>
                   <p className="text-lg text-secondary/70 italic leading-relaxed">
                     {selectedStaff.bio || "Staff pendidikan berdedikasi di UPTD SDN 1 Gabuskulon."}
                   </p>
                 </div>

                 <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                       <h5 className="text-[9px] font-black uppercase text-secondary/30 tracking-widest mb-2 italic">Mata Pelajaran</h5>
                       <p className="text-sm font-bold text-secondary">{selectedStaff.subject || '-'}</p>
                    </div>
                    <div>
                       <h5 className="text-[9px] font-black uppercase text-secondary/30 tracking-widest mb-2 italic">Pendidikan</h5>
                       <p className="text-sm font-bold text-secondary">{selectedStaff.edu || '-'}</p>
                    </div>
                    <div>
                       <h5 className="text-[9px] font-black uppercase text-secondary/30 tracking-widest mb-2 italic">Email Sekolah</h5>
                       <p className="text-sm font-bold text-primary italic lowercase underline underline-offset-4 decoration-primary/30 break-all">{selectedStaff.email || `${selectedStaff.name.split(',')[0].toLowerCase().replace(/ /g, '.')}@sdn1gabuskulon.sch.id`}</p>
                    </div>
                    <div>
                       <h5 className="text-[9px] font-black uppercase text-secondary/30 tracking-widest mb-2 italic">Golongan</h5>
                       <p className="text-sm font-bold text-secondary">{selectedStaff.gol || '-'}</p>
                    </div>
                 </div>

                 {selectedStaff.achievements && selectedStaff.achievements.length > 0 && (
                   <div>
                      <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-6 italic">Prestasi & Penghargaan</h4>
                      <div className="space-y-4">
                         {selectedStaff.achievements.map((ach, idx) => (
                           <div key={idx} className="flex gap-4 items-center group">
                              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-secondary transition-all">
                                 <Award size={16} />
                              </div>
                              <p className="text-sm font-bold text-secondary italic">{ach}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profil;
