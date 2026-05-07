import { motion } from 'motion/react';
import { Camera, Video, ChevronRight, Maximize2, Play } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const IMAGES = [
  { id: 1, src: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop', title: 'Suasana Kelas Modern', categoryKey: 'gallery.categories.facility' },
  { id: 2, src: 'https://images.unsplash.com/photo-1510531704581-5b2870972060?q=80&w=2020&auto=format&fit=crop', title: 'Kegiatan Outbound Siswa', categoryKey: 'gallery.categories.activity' },
  { id: 3, src: 'https://images.unsplash.com/photo-1577891721396-227dbb86bc81?q=80&w=2070&auto=format&fit=crop', title: 'Perayaan HUT RI', categoryKey: 'gallery.categories.activity' },
  { id: 4, src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop', title: 'Siswa Belajar Bersama', categoryKey: 'gallery.categories.education' },
  { id: 5, src: 'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop', title: 'Lari Pagi Sehat', categoryKey: 'gallery.categories.sports' },
  { id: 6, src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop', title: 'Eksperimen di Laborat', categoryKey: 'gallery.categories.science' },
];

const Galeri = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('gallery.categories.all');
  
  const categoriesList = [
    { id: 'all', key: 'gallery.categories.all', name: t('gallery.categories.all') },
    { id: 'facility', key: 'gallery.categories.facility', name: t('gallery.categories.facility') },
    { id: 'activity', key: 'gallery.categories.activity', name: t('gallery.categories.activity') },
    { id: 'achievement', key: 'gallery.categories.achievement', name: t('gallery.categories.achievement') },
    { id: 'extra', key: 'gallery.categories.extra', name: t('gallery.categories.extra') },
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto px-2">
           <div className="flex items-center gap-3 text-primary font-bold text-sm mb-4 justify-center">
            <span>{t('gallery.breadcrumb')}</span>
            <ChevronRight size={14} />
            <span className="text-secondary/50 uppercase tracking-widest">{t('gallery.subtitle')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-6 italic">{t('gallery.title')}</h1>
          <p className="text-lg text-secondary/60 leading-relaxed italic">
            {t('gallery.description')}
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 px-2">
           {categoriesList.map(cat => (
              <button 
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`px-8 py-3 rounded-2xl font-bold transition-all uppercase tracking-tighter text-sm italic ${
                   activeTab === cat.key 
                   ? 'bg-secondary text-white shadow-xl scale-105' 
                   : 'bg-white text-secondary/40 hover:bg-gray-100 hover:text-secondary'
                }`}
              >
                 {cat.name}
              </button>
           ))}
        </div>

        {/* Grid Media */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {IMAGES.filter(img => activeTab === 'gallery.categories.all' || img.categoryKey === activeTab).map((img, i) => (
              <motion.div 
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white p-3 rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden cursor-pointer"
              >
                 <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                    <img src={img.src} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="w-10 h-10 bg-white/90 backdrop-blur-md text-secondary rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform">
                          <Maximize2 size={16} />
                       </div>
                    </div>
                    <div className="absolute top-3 left-3">
                       <span className="bg-white/90 backdrop-blur-md text-secondary px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm">
                          {t(img.categoryKey)}
                       </span>
                    </div>
                 </div>
                 <div className="px-1">
                    <h3 className="font-display font-bold text-secondary text-base mb-1 italic truncate group-hover:text-primary transition-colors">{img.title}</h3>
                    <p className="text-secondary/30 text-[8px] font-black uppercase tracking-widest">Visual Archive 2024</p>
                 </div>
              </motion.div>
           ))}
        </div>

        {/* Video Highlight Section */}
        <div className="mt-32">
           <div className="flex items-center justify-between mb-12 flex-col md:flex-row gap-6">
              <div className="text-center md:text-left">
                 <h2 className="text-3xl font-display font-bold text-secondary mb-2 italic">{t('gallery.videoTitle')}</h2>
                 <p className="text-secondary/50 italic">{t('gallery.videoSubtitle')}</p>
              </div>
              <button className="bg-primary text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-primary-dark transition-all">
                 {t('gallery.videoYoutubeBtn')} <Video size={18} />
              </button>
           </div>

           <div className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer bg-secondary">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
                alt="Video Cover" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2000ms]" 
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
                 <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-secondary shadow-[0_0_50px_rgba(236,180,14,0.5)] group-hover:scale-125 transition-all mb-8">
                    <Play size={40} fill="currentColor" className="ml-1" />
                 </div>
                 <h3 className="text-3xl md:text-5xl font-display font-bold italic mb-4">{t('gallery.videoProfileTitle')}</h3>
                 <p className="text-white/60 tracking-widest text-sm font-bold uppercase italic">{t('gallery.videoDuration')}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Galeri;
