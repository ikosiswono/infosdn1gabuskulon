import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import { LiveNotifications } from './components/LiveNotifications';
import Home from './pages/Home';
import Arsip from './pages/Arsip';
import Profil from './pages/Profil';
import Berita from './pages/Berita';
import BeritaDetail from './pages/BeritaDetail';
import Galeri from './pages/Galeri';
import Kontak from './pages/Kontak';
import Admin from './pages/Admin';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <ScrollToTopButton />
      <LiveNotifications />
      <main className="flex-grow overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/arsip" element={<Arsip />} />
              <Route path="/berita" element={<Berita />} />
              <Route path="/berita/:id" element={<BeritaDetail />} />
              <Route path="/galeri" element={<Galeri />} />
              <Route path="/kontak" element={<Kontak />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
