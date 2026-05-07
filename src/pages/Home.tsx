import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Archive, Award, Users, BookOpen, Newspaper, Calendar, GraduationCap, Loader2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NEWS_DATA } from '../data/mockData';
import { SCHOOL_INFO } from '../constants/schoolInfo';
import { useState, useEffect, useRef } from 'react';

const Home = () => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  const backgroundY = useTransform(scrollY, [0, 800], [0, 200]);
  const contentY = useTransform(scrollY, [0, 500], [0, -50]);
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const img = new Image();
    img.src = "https://github.com/ikosiswono/infosdn1gabuskulon/blob/main/assets/gambar/halaman%201/halaman%201%20(1).png?raw=true";
    img.onload = () => setImageLoaded(true);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section ref={containerRef} className="relative h-[95vh] md:h-[100vh] flex items-center justify-center overflow-hidden bg-secondary">
        {/* Loading Spinner */}
        <AnimatePresence>
          {!imageLoaded && (
            <motion.div 
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-secondary"
            >
              <Loader2 className="text-accent animate-spin w-10 h-10" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background Image / Overlay with Parallax */}
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0"
        >
          <motion.img 
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ 
              opacity: imageLoaded ? 1 : 0, 
              scale: imageLoaded ? 1.1 : 1.15 
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://github.com/ikosiswono/infosdn1gabuskulon/blob/main/assets/gambar/halaman%201/halaman%201%20(1).png?raw=true" 
            alt={SCHOOL_INFO.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45"></div>
        </motion.div>

        <motion.div 
          style={{ y: contentY, opacity: contentOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 text-center"
        >
          {/* Content remains... will update following block */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-2"
            >
              <h2 className="text-white font-display font-black uppercase text-[32px] sm:text-[40px] md:text-[48px] lg:text-[64px] leading-tight drop-shadow-lg italic">
                {t('home.hero.welcome')}
              </h2>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] font-display font-bold text-accent mb-4 uppercase italic tracking-wider whitespace-nowrap"
            >
              UPTD SDN 1 GABUS KULON
            </motion.h1>

             <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[22px] font-display font-bold text-white mb-10 uppercase italic tracking-wider"
            >
              {t('home.hero.subtitle')}
            </motion.p>
            
            <p className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed font-sans italic">
              {t('home.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/arsip" className="bg-primary text-white hover:bg-primary-dark px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 btn-glow transition-all hover:scale-105 active:scale-95 italic">
                {t('home.hero.cta')} <ArrowRight size={16} />
              </Link>
              <Link to="/profil" className="bg-white/5 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-white hover:text-secondary transition-all italic">
                {t('home.hero.profile')}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Floating Quick Access (Bottom of Hero) - Hidden on very small mobile */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 hidden md:block">
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: t('home.quickAccess.news'), icon: Newspaper, link: '/berita', color: 'bg-primary' },
              { title: t('home.quickAccess.archive'), icon: Archive, link: '/arsip', color: 'bg-accent' },
              { title: t('home.quickAccess.gallery'), icon: Users, link: '/galeri', color: 'bg-primary-dark' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="bg-white/90 backdrop-blur-xl p-4 rounded-xl shadow-lg flex items-center gap-4 border border-white/40 group cursor-pointer"
              >
                <div className={`${item.color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <h3 className="font-black text-secondary text-xs uppercase italic">{item.title}</h3>
                  <Link to={item.link} className="text-[9px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all italic">
                    {t('home.quickAccess.open')} <ArrowRight size={10} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 bg-soft-bg/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { val: '850+', label: t('home.stats.students'), icon: Users },
              { val: '45+', label: t('home.stats.teachers'), icon: GraduationCap },
              { val: '120+', label: t('home.stats.achievements'), icon: Award },
              { val: '25+', label: t('home.stats.years'), icon: Calendar },
            ].map((stat, i) => (
              <div key={i} className="text-center group p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-sm text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <stat.icon size={24} className="md:w-8 md:h-8" />
                </div>
                <h4 className="text-2xl md:text-4xl font-display font-bold text-secondary italic">{stat.val}</h4>
                <p className="text-secondary/40 text-[10px] md:text-sm font-black uppercase tracking-widest italic">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Highlight - Vertical Grid for clean mobile view */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 md:mb-16">
            <div>
              <span className="text-primary font-black tracking-[0.2em] uppercase text-[10px] mb-2 block italic">{t('home.news.subtitle')}</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-secondary italic">{t('home.news.title')}</h2>
            </div>
            <Link to="/berita" className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all italic">
              {t('home.news.viewAll')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {NEWS_DATA.slice(0, 3).map((news, i) => (
              <motion.div
                key={news.id}
                whileHover={{ y: -5 }}
                className="relative group h-full"
              >
                {/* Abstract decorative layers */}
                <motion.div 
                  animate={{ 
                    rotate: [-1, -3, -1],
                    scale: [0.99, 1.01, 0.99],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-primary/10 rounded-2xl translate-x-3 translate-y-3 -z-10 blur-[2px] group-hover:translate-x-5 group-hover:translate-y-5 transition-transform" 
                />
                <motion.div 
                  animate={{ 
                    rotate: [1, 3, 1],
                    scale: [0.99, 1.02, 0.99],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute inset-0 bg-accent/20 rounded-2xl -translate-x-2 translate-y-2 -z-10 blur-[2px] group-hover:-translate-x-4 group-hover:translate-y-4 transition-transform" 
                />

                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all h-full flex flex-col">
                  <div className="relative h-48 md:h-60 overflow-hidden">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-3 left-3 bg-accent/90 backdrop-blur-md text-secondary px-2.5 py-1 rounded-lg text-[9px] font-black uppercase italic shadow-lg">
                      {news.date}
                    </div>
                  </div>
                  <div className="p-5 md:p-8 flex-grow">
                    <h3 className="text-base md:text-xl font-bold text-secondary mb-2 md:mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors italic">
                      {news.title}
                    </h3>
                    <p className="text-secondary/50 text-[11px] md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2 italic">
                      {news.excerpt}
                    </p>
                    <Link to={`/berita/${news.id}`} className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 italic">
                      {t('home.news.readMore')} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Feed */}
      <section className="py-16 md:py-24 bg-soft-bg/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-black tracking-[0.2em] uppercase text-[10px] mb-2 block italic">{t('home.facebook.subtitle')}</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-secondary italic mb-6">{t('home.facebook.title')}</h2>
            <p className="text-secondary/60 italic leading-relaxed mb-8">
              {t('home.facebook.description')}
            </p>
            <a 
              href="https://www.facebook.com/people/UPTD-SDN-1-Gabuskulon/100092675345248/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-secondary font-black text-xs uppercase tracking-widest hover:text-primary transition-colors italic"
            >
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1877F2]">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              {t('home.facebook.visit')}
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center justify-center h-[650px]"
            >
              <div className="rounded-[2rem] overflow-hidden border border-gray-50 bg-gray-50 w-full h-full">
                <iframe 
                  src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid09XpzAK7F7NqBtXzP5FWPZfrHhb7bHTTga9GcPrB93kyepKq6bSnwBhsGuP8f6tBJl%26id%3D100092675345248&show_text=true&width=500" 
                  width="100%" 
                  height="100%" 
                  title="Facebook Post 1"
                  style={{ border: 'none', overflow: 'hidden' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center justify-center h-[650px]"
            >
              <div className="rounded-[2rem] overflow-hidden border border-gray-50 bg-gray-50 w-full h-full">
                <iframe 
                  src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0dy7sH17fM5Hmfg4Dpz7TgNNkiUj6SoAmGQhGr9M8rqbhTrZq99K4hDHFHK1AZSVMl%26id%3D100092675345248&show_text=true&width=500" 
                  width="100%" 
                  height="100%" 
                  title="Facebook Post 2"
                  style={{ border: 'none', overflow: 'hidden' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center justify-center h-[650px]"
            >
              <div className="rounded-[2rem] overflow-hidden border border-gray-50 bg-gray-50 w-full h-full">
                <iframe 
                  src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid022bAoj698cmn4GEMvBdkD5Z9JfaXR8SXanLt5pmjKzjWcS8gHZPArDf1THhKNrkFel%26id%3D100092675345248&show_text=true&width=500" 
                  width="100%" 
                  height="100%" 
                  title="Facebook Post 3"
                  style={{ border: 'none', overflow: 'hidden' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center justify-center h-[650px]"
            >
              <div className="rounded-[2rem] overflow-hidden border border-gray-50 bg-gray-50 w-full h-full">
                <iframe 
                  src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0fz5nG4SHdervG2byzB1yekUhzXvXH5SPpwCZAfnYnuu1MPYnLuJA2LWYH1As9tjgl%26id%3D100092675345248&show_text=true&width=500" 
                  width="100%" 
                  height="100%" 
                  title="Facebook Post 4"
                  style={{ border: 'none', overflow: 'hidden' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center justify-center h-[650px]"
            >
              <div className="rounded-[2rem] overflow-hidden border border-gray-50 bg-gray-50 w-full h-full">
                <iframe 
                  src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid02jJcv7NmtkdPaL65UsHTnwHGGBmvftPhz6Nt63pidgYdcua9WXaKhvhCcXJBiYaaml%26id%3D100092675345248&show_text=true&width=500" 
                  width="100%" 
                  height="100%" 
                  title="Facebook Post 5"
                  style={{ border: 'none', overflow: 'hidden' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Highlight Section */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-primary font-black tracking-[0.3em] uppercase text-[11px] mb-4 block italic"
              >
                {t('home.video.subtitle')}
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-display font-black text-secondary italic mb-8 leading-tight"
              >
                {t('home.video.title')}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-secondary/70 italic leading-relaxed mb-10 text-base max-w-xl"
              >
                {t('home.video.description')}
              </motion.p>
              
              <div className="space-y-5 mb-10">
                {[
                  { title: t('home.video.feature1'), icon: '01' },
                  { title: t('home.video.feature2'), icon: '02' },
                  { title: t('home.video.feature3'), icon: '03' }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-6 group cursor-default"
                  >
                    <span className="text-primary font-black text-sm italic tracking-tighter w-8 group-hover:scale-125 transition-transform origin-left">{item.icon}</span>
                    <div className="h-[2px] flex-grow bg-gray-100 group-hover:bg-primary/20 transition-colors"></div>
                    <span className="text-secondary font-black text-sm uppercase tracking-widest italic group-hover:text-primary transition-colors">{item.title}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <Link 
                  to="/arsip" 
                  className="inline-flex gradient-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest items-center gap-3 shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95 italic"
                >
                  <Download size={20} /> {t('home.video.downloadBtn')}
                </Link>
              </motion.div>
            </div>
            
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10"></div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-secondary p-3 rounded-[3rem] shadow-2xl relative max-w-[560px] w-full"
              >
                <div className="rounded-[2.5rem] overflow-hidden bg-black aspect-[560/429]">
                  <iframe 
                    src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1710781853244837%2F&show_text=true&width=560&t=0" 
                    width="100%" 
                    height="100%" 
                    title="Featured Video"
                    style={{ border: 'none', overflow: 'hidden' }} 
                    scrolling="no" 
                    frameBorder="0" 
                    allowFullScreen={true} 
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  ></iframe>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Archive Call-to-Action */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="gradient-primary rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
            {/* Decors */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-32 -mb-32"></div>
            
            <div className="relative z-10">
              <Archive size={64} className="text-accent mx-auto mb-8 animate-bounce" />
              <h2 className="text-4xl md:text-6xl text-white font-display mb-6">{t('home.cta.title')}</h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('home.cta.description')}
              </p>
              <Link to="/arsip" className="inline-flex bg-accent text-secondary px-10 py-5 rounded-full font-bold text-xl items-center gap-3 shadow-2xl hover:scale-105 transition-transform active:scale-95">
                {t('home.cta.button')} <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
