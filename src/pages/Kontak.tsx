import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, ChevronRight } from 'lucide-react';
import { SCHOOL_INFO } from '../constants/schoolInfo';
import { useTranslation } from 'react-i18next';

const Kontak = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-20">
           <div className="flex items-center gap-3 text-primary font-bold text-sm mb-4">
            <span>{t('contact.breadcrumb')}</span>
            <ChevronRight size={14} />
            <span className="text-secondary/50 uppercase tracking-widest">{t('contact.subtitle')}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-secondary mb-6">{t('contact.title')}</h1>
          <p className="text-lg text-secondary/60 max-w-2xl leading-relaxed">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Info */}
          <div className="space-y-10">
            {[
              { icon: MapPin, title: t('contact.infoTitle1'), detail: SCHOOL_INFO.fullAddress },
              { icon: Phone, title: t('contact.infoTitle2'), detail: SCHOOL_INFO.phone },
              { icon: Mail, title: t('contact.infoTitle3'), detail: SCHOOL_INFO.email },
              { icon: Clock, title: t('contact.infoTitle4'), detail: t('contact.infoDetail4') },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start group"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <item.icon size={26} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-secondary text-xl mb-1 italic">{item.title}</h3>
                  <p className="text-secondary/60 leading-relaxed italic">{item.detail}</p>
                </div>
              </motion.div>
            ))}

            <a 
              href="https://wa.me/6287828771960" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={t('contact.whatsappTitle')}
              className="p-8 bg-soft-bg/30 rounded-[2rem] border border-soft-bg flex items-center justify-between group cursor-pointer hover:bg-soft-bg/50 transition-all block"
            >
               <div>
                  <h4 className="font-display font-bold text-secondary text-lg mb-1">{t('contact.whatsappTitle')}</h4>
                  <p className="text-secondary/50 text-sm italic">{t('contact.whatsappDescription')}</p>
               </div>
               <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
               </div>
            </a>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
            
            <h3 className="text-2xl font-display font-bold text-secondary mb-10 italic">{t('contact.formTitle')}</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="text-[10px] font-black uppercase text-secondary/30 tracking-widest pl-2 italic">{t('contact.fieldName')}</label>
                  <input id="contact-name" type="text" placeholder={t('contact.fieldNamePlaceholder')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all text-sm italic" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-[10px] font-black uppercase text-secondary/30 tracking-widest pl-2 italic">{t('contact.fieldEmail')}</label>
                  <input id="contact-email" type="email" placeholder={t('contact.fieldEmailPlaceholder')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all text-sm italic" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-subject" className="text-[10px] font-black uppercase text-secondary/30 tracking-widest pl-2 italic">{t('contact.fieldSubject')}</label>
                <select id="contact-subject" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all text-sm italic">
                  <option value="ppdb">{t('contact.fieldSubjectOptions.ppdb')}</option>
                  <option value="archive">{t('contact.fieldSubjectOptions.archive')}</option>
                  <option value="visit">{t('contact.fieldSubjectOptions.visit')}</option>
                  <option value="feedback">{t('contact.fieldSubjectOptions.feedback')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="text-[10px] font-black uppercase text-secondary/30 tracking-widest pl-2 italic">{t('contact.fieldMessage')}</label>
                <textarea id="contact-message" rows={4} placeholder={t('contact.fieldMessagePlaceholder')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all text-sm italic resize-none"></textarea>
              </div>

              <button type="submit" aria-label={t('contact.btnSend')} className="w-full gradient-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/30 transition-all active:scale-95 italic">
                {t('contact.btnSend')} <Send size={20} />
              </button>
            </form>
          </motion.div>
        </div>

        {/* Google Maps Embed */}
        <div className="mt-32 h-[500px] bg-gray-100 rounded-[3rem] overflow-hidden shadow-inner relative group">
           <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d609.8291284436878!2d108.05027462523228!3d-6.412372790170057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6eb57d050f09a5%3A0x7ab790ca2f1a4446!2sUPTD%20SDN%201%20GABUSKULON!5e1!3m2!1sid!2sid!4v1778202918628!5m2!1sid!2sid" 
              className="w-full h-full border-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title={t('contact.mapTitle')}
           />
           <a 
              href="https://maps.app.goo.gl/kUJKKTky8y5Yorjk9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white flex items-center gap-4 hover:bg-primary hover:text-white transition-all group/link"
           >
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-secondary group-hover/link:bg-white transition-colors">
                 <MapPin size={18} />
              </div>
              <div className="text-left font-display">
                 <h4 className="font-bold text-sm">{t('contact.mapTitle')}</h4>
                 <p className="text-[10px] opacity-50">{t('contact.mapAction')}</p>
              </div>
           </a>
        </div>
      </div>
    </div>
  );
};

export default Kontak;
