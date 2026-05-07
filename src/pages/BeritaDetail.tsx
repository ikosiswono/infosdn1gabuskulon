import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, MessageCircle, ChevronRight } from 'lucide-react';
import { NEWS_DATA } from '../data/mockData';
import { useTranslation } from 'react-i18next';

const BeritaDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const news = NEWS_DATA.find(n => n.id === id);

  if (!news) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h1 className="text-4xl font-display font-bold text-secondary mb-6">{t('news.emptyTitle')}</h1>
        <Link to="/berita" className="text-primary font-bold hover:underline">{t('news.detailBack')}</Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-primary font-bold text-sm mb-10">
          <Link to="/berita" className="hover:text-primary-dark">{t('news.title')}</Link>
          <ChevronRight size={14} />
          <span className="text-secondary/50 truncate uppercase tracking-widest max-w-[200px]">{news.title}</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-secondary mb-8 leading-tight italic">
            {news.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-secondary/40 uppercase tracking-widest border-y border-gray-100 py-6">
            <span className="flex items-center gap-2 text-primary italic"><Calendar size={18} /> {news.date}</span>
            <span className="flex items-center gap-2 italic"><User size={18} /> {news.author}</span>
          </div>
        </div>

        {/* Featured Image */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 rounded-[3rem] overflow-hidden shadow-2xl h-[400px] md:h-[600px] relative"
        >
          <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </motion.div>

        {/* Content */}
        <article className="prose prose-lg prose-slate max-w-none mb-20 italic text-secondary/80 leading-relaxed space-y-8">
          <p className="text-xl font-medium text-secondary leading-normal">
            Gabuskulon, {news.date} — {news.excerpt}
          </p>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
            totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae 
            dicta sunt explicabo.
          </p>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur 
            magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem 
            ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora 
            incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
          </p>
          <blockquote className="border-l-8 border-accent pl-8 py-4 bg-soft-bg/30 text-2xl font-display font-bold text-secondary italic rounded-r-2xl">
            "{t('profile.introDescription')}"
          </blockquote>
          <p>
            Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut 
            aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit 
            esse quam nihil molestiae consequatur.
          </p>
        </article>

        {/* Share & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-10 border-t border-gray-100">
           <div className="flex items-center gap-4">
              <span className="text-xs font-black uppercase text-secondary/30 italic">Bagikan:</span>
              <div className="flex gap-4">
                 {[Facebook, Twitter, MessageCircle].map((Icon, i) => (
                    <button key={i} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all shadow-sm">
                       <Icon size={20} />
                    </button>
                 ))}
              </div>
           </div>
           <Link to="/berita" className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all uppercase tracking-widest text-sm italic border-b border-primary pb-1">
              <ArrowLeft size={18} /> {t('news.detailBack')}
           </Link>
        </div>
      </div>
    </div>
  );
};

export default BeritaDetail;
