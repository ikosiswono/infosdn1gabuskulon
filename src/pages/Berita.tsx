import { motion } from 'motion/react';
import { NEWS_DATA } from '../data/mockData';
import { Calendar, User, ArrowRight, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Berita = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-28 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 text-primary font-bold text-sm mb-4">
            <span>{t('news.breadcrumb')}</span>
            <ChevronRight size={14} />
            <span className="text-secondary/50 uppercase tracking-widest">{t('news.subtitle')}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-secondary mb-6">{t('news.title')}</h1>
          <p className="text-lg text-secondary/60 max-w-2xl leading-relaxed italic">
            {t('news.introDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main News Feed */}
          <div className="lg:col-span-8 space-y-16">
            {NEWS_DATA.map((news, i) => (
              <motion.article 
                key={news.id} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group cursor-pointer"
              >
                {/* Abstract decorative layers */}
                <motion.div 
                  animate={{ 
                    rotate: [-0.5, -1, -0.5],
                    scale: [0.99, 1.01, 0.99],
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-primary/5 rounded-[2rem] translate-x-4 translate-y-4 -z-10 blur-[4px] group-hover:translate-x-6 group-hover:translate-y-6 transition-transform" 
                />
                <motion.div 
                  animate={{ 
                    rotate: [0.5, 1, 0.5],
                    scale: [0.99, 1.02, 0.99],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute inset-0 bg-accent/10 rounded-[2rem] -translate-x-3 translate-y-3 -z-10 blur-[4px] group-hover:-translate-x-5 group-hover:translate-y-5 transition-transform" 
                />

                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group-hover:shadow-xl transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 h-[250px] md:h-[300px] rounded-[2rem] overflow-hidden shadow-xl border border-gray-100">
                      <img 
                        src={news.image} 
                        alt={news.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    </div>
                    <div className="md:col-span-7">
                      <div className="flex items-center gap-4 text-xs font-bold text-primary mb-4 uppercase tracking-widest">
                         <span className="flex items-center gap-1"><Calendar size={12}/> {news.date}</span>
                         <span className="w-1 h-1 bg-accent rounded-full"></span>
                         <span className="flex items-center gap-1"><User size={12}/> {news.author}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary mb-5 leading-tight group-hover:text-primary transition-colors">
                        {news.title}
                      </h2>
                      <p className="text-secondary/60 leading-relaxed mb-8 italic">
                        {news.excerpt}
                      </p>
                      <Link to={`/berita/${news.id}`} className="inline-flex items-center gap-2 p-1 text-primary font-bold border-b-2 border-accent hover:gap-4 transition-all uppercase text-sm tracking-widest italic">
                        {t('news.readMore')} <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            {/* Search Sidebar */}
            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
               <h3 className="text-xl font-display font-bold text-secondary mb-6 italic">{t('news.searchTitle')}</h3>
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder={t('news.searchPlaceholder')} 
                    aria-label={t('news.searchPlaceholder')}
                    className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-primary shadow-sm italic text-sm" 
                  />
               </div>
            </div>

            {/* Tags Cloud */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
               <h3 className="text-xl font-display font-bold text-secondary mb-6 italic">{t('news.topicsTitle')}</h3>
               <div className="flex flex-wrap gap-2">
                  {['PPDB', 'Juara', 'Outbound', 'Digital', 'Akreditasi', 'Budaya', 'Kurikulum', 'Sains'].map(tag => (
                    <button 
                      key={tag} 
                      aria-label={`${t('news.filterByTopic')}: ${tag}`}
                      className="px-4 py-2 bg-gray-50 text-secondary/50 text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-colors cursor-pointer uppercase tracking-widest"
                    >
                      #{tag}
                    </button>
                  ))}
               </div>
            </div>

            {/* Newsletter */}
            <div className="gradient-primary p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
               <h3 className="text-xl font-display font-bold mb-4 italic">{t('news.newsletterTitle')}</h3>
               <p className="text-white/70 text-sm mb-6 leading-relaxed">{t('news.newsletterDescription')}</p>
               <input 
                 type="email" 
                 placeholder={t('news.newsletterPlaceholder')} 
                 aria-label={t('news.newsletterPlaceholder')}
                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl mb-3 focus:bg-white focus:text-secondary transition-all outline-none text-sm placeholder:text-white/50" 
               />
               <button 
                 aria-label={t('news.newsletterBtn')}
                 className="w-full bg-accent text-secondary font-black py-4 rounded-xl text-sm shadow-lg hover:scale-105 transition-transform uppercase italic"
               >
                  {t('news.newsletterBtn')}
               </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Berita;
