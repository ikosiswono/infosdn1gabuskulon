import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, Archive, Image as ImageIcon, Contact, LayoutDashboard, Info, Newspaper, Languages } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SCHOOL_INFO } from '../constants/schoolInfo';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'id' ? 'en' : 'id';
    i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: '/', icon: LayoutDashboard },
    { name: t('nav.profile'), path: '/profil', icon: Info },
    { name: t('nav.archive'), path: '/arsip', icon: Archive },
    { name: t('nav.news'), path: '/berita', icon: Newspaper },
    { name: t('nav.gallery'), path: '/galeri', icon: ImageIcon },
    { name: t('nav.contact'), path: '/kontak', icon: Contact },
  ];

  const isHomePage = location.pathname === '/';
  const navBg = (scrolled || !isHomePage) 
    ? 'glass-nav py-2 shadow-lg' 
    : 'bg-transparent py-5';

  const activeLink = (path: string) => 
    location.pathname === path ? 'text-accent' : 'text-white/80 hover:text-white transition-colors';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 md:gap-3 group" aria-label={t('nav.home')}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg overflow-hidden border-2 border-primary">
            <img 
              src="https://github.com/ikosiswono/infosdn1gabuskulon/blob/main/assets/gambar/logo/1776999319316.png?raw=true" 
              alt="Logo UPTD SDN 1 GABUS KULON" 
              className="w-full h-full object-contain p-1" 
            />
          </div>
          <div>
            <h1 className="text-white font-display font-bold text-sm md:text-lg leading-tight uppercase tracking-tighter italic">{SCHOOL_INFO.name}</h1>
            <p className="text-white/50 text-[8px] md:text-[10px] tracking-widest uppercase font-black italic">UPTD Pendidikan</p>
          </div>
        </Link>

        {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`font-black text-[11px] uppercase tracking-widest flex items-center gap-2 italic ${activeLink(link.path)}`}>
                 {activeLink(link.path).includes('text-accent') && <link.icon size={14} className="animate-pulse" />}
                 {link.name}
              </Link>
            ))}
            
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-white hover:text-accent transition-colors font-black text-[10px] uppercase tracking-widest italic"
              aria-label={t('nav.toggleLanguage', { lang: i18n.language === 'id' ? 'English' : 'Indonesia' })}
            >
              <Languages size={14} />
              {i18n.language.toUpperCase()}
            </button>

            <Link to="/admin" className="bg-accent text-secondary px-6 py-2 rounded-full font-black text-[11px] uppercase tracking-widest btn-glow italic">
              {t('nav.admin')}
            </Link>
          </div>

          {/* Mobile Toggle & Language */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="text-white hover:text-accent font-black text-[10px] uppercase italic"
              aria-label={t('nav.toggleLanguage', { lang: i18n.language === 'id' ? 'English' : 'Indonesia' })}
            >
              {i18n.language.toUpperCase()}
            </button>
            <button 
              className="text-white p-2" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full glass-nav px-6 py-8 flex flex-col gap-6 shadow-2xl"
        >
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 text-xl font-display ${location.pathname === link.path ? 'text-accent' : 'text-white'}`}
            >
              <link.icon size={24} />
              {link.name}
            </Link>
          ))}
          <Link 
            to="/admin" 
            onClick={() => setIsOpen(false)}
            className="w-full bg-accent text-secondary py-4 rounded-xl text-center font-bold text-lg"
          >
            Login Admin
          </Link>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
