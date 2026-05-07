import { GraduationCap, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter, Lock, Unlock, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SCHOOL_INFO } from '../constants/schoolInfo';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { user, login, logout, isAdmin } = useAuth();
  const { t } = useTranslation();

  return (
    <footer className="bg-secondary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {/* Info Sekolah */}
        <div className="col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden p-1 border-2 border-primary">
              <img 
                src="https://github.com/ikosiswono/infosdn1gabuskulon/blob/main/assets/gambar/logo/1776999319316.png?raw=true" 
                alt="Logo UPTD SDN 1 GABUS KULON" 
                className="w-full h-full object-contain" 
              />
            </div>
            <h2 className="font-display font-bold text-lg uppercase tracking-widest italic">{SCHOOL_INFO.name}</h2>
          </div>
          <p className="text-white/50 mb-8 text-xs leading-relaxed italic pr-4">
             {t('footer.schoolMoto')}
          </p>
          <div className="flex gap-3">
            {[
              { icon: Facebook, label: t('footer.socialFacebook') },
              { icon: Instagram, label: t('footer.socialInstagram') },
              { icon: Youtube, label: t('footer.socialYoutube') },
              { icon: Twitter, label: t('footer.socialTwitter') }
            ].map((item, i) => (
              <a 
                key={i} 
                href="#" 
                className="w-9 h-9 rounded-xl border border-white/5 flex items-center justify-center hover:bg-accent hover:text-secondary hover:border-accent transition-all duration-300"
                aria-label={item.label}
              >
                <item.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Link Cepat */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-accent italic">{t('footer.quickLinks')}</h3>
          <ul className="flex flex-col gap-3 text-white/50 text-xs font-bold uppercase tracking-wider italic">
            <li><Link to="/profil" className="hover:text-primary transition-colors">{t('nav.profile')}</Link></li>
            <li><Link to="/arsip" className="hover:text-primary transition-colors">{t('nav.archive')}</Link></li>
            <li><Link to="/berita" className="hover:text-primary transition-colors">{t('nav.news')}</Link></li>
            <li><Link to="/galeri" className="hover:text-primary transition-colors">{t('nav.gallery')}</Link></li>
          </ul>
        </div>

        {/* Arsip Populer */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-accent italic">{t('footer.systemAccess')}</h3>
          <div className="flex flex-col gap-4">
            {!user ? (
              <button 
                onClick={login}
                className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-widest italic hover:text-accent transition-colors"
              >
                <Lock size={14} className="text-accent" />
                {t('footer.adminLogin')}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-accent text-[10px] font-black uppercase tracking-widest italic">
                  <Unlock size={14} />
                  {isAdmin ? t('footer.adminMode') : t('footer.userMode')}
                </div>
                <p className="text-[9px] text-white/30 italic">{user.email}</p>
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest italic hover:text-red-300 transition-colors mt-2"
                >
                  <LogOut size={14} /> {t('footer.logout')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Kontak */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-accent italic">{t('footer.contactUs')}</h3>
          <ul className="flex flex-col gap-4 text-white/50 italic">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">{SCHOOL_INFO.fullAddress}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-primary shrink-0" />
              <span className="text-[11px]">{SCHOOL_INFO.phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-primary shrink-0" />
              <span className="text-[11px] break-all">{SCHOOL_INFO.email}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-black">
          © {new Date().getFullYear()} {SCHOOL_INFO.name}. <br className="md:hidden" /> {t('footer.rights').toUpperCase()}
        </p>
        <div className="flex gap-6 text-[9px] text-white/20 uppercase tracking-widest font-black italic">
          <a href="#" className="hover:text-accent transition-colors">{t('footer.privacy')}</a>
          <a href="#" className="hover:text-accent transition-colors">{t('footer.terms')}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
