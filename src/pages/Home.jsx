import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NetworkBackground from '../components/NetworkBackground';
import { supabase } from '../supabaseClient';

// Custom Counter Component
const AnimatedCounter = ({ from, to, duration = 2 }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: "easeOut" });
    return controls.stop;
  }, [count, to, duration]);

  return <motion.span>{rounded}</motion.span>;
};

// Title Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [homeImages, setHomeImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // For Lightbox

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch Profile
      const { data: profileData } = await supabase.from('profile_info').select('*').eq('id', 1).single();
      if (profileData) setProfile(profileData);

      // Fetch Home Images
      const { data: imagesData } = await supabase.from('home_images').select('*').eq('is_visible', true).order('order_index', { ascending: true }).order('created_at', { ascending: false });
      if (imagesData) setHomeImages(imagesData);

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ paddingTop: '140px', textAlign: 'center', color: 'var(--accent)' }}>Loading...</div>;
  }

  if (!profile) return null;

  return (
    <div style={{ paddingTop: '100px', position: 'relative' }}>
      {/* Lightbox Overlay */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          {selectedImage.match(/\.(mp4|webm)$/i) ? (
            <video 
              src={selectedImage} 
              controls
              autoPlay
              style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '8px', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : selectedImage.match(/\.(pdf|doc|docx)$/i) ? (
            <iframe 
              src={selectedImage} 
              style={{ width: '90%', height: '90%', borderRadius: '8px', border: 'none', background: '#fff' }}
            />
          ) : (
            <img 
              src={selectedImage} 
              alt="Full Screen" 
              style={{
                maxWidth: '95%',
                maxHeight: '95%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 0 30px rgba(0,0,0,0.5)'
              }}
            />
          )}
        </div>
      )}

      {/* Animated Digital Background */}
      <NetworkBackground />

      <section className="hero" style={{ minHeight: 'auto', padding: '4rem 0', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4rem',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4rem',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}>
              {/* Profile Card (Left Column) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
                transition={{ 
                  opacity: { duration: 0.8 },
                  scale: { duration: 0.8 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" } 
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px',
                  padding: '1.5rem',
                  maxWidth: '350px',
                  width: '100%',
                  color: '#fff',
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)'
                }}
              >
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  marginBottom: '1.5rem',
                  aspectRatio: '3/4',
                  backgroundColor: '#f3f4f6',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(59, 130, 246, 0.2), transparent)', zIndex: 1 }}></div>
                  {profile.photo_url && (
                    <img 
                      src={profile.photo_url} 
                      alt="Aafin K S"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', lineHeight: '1.1' }}>Aafin K S</h2>
                <p style={{ color: '#a3a3a3', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  {profile.bio}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                  <a href="https://linkedin.com/in/Aafin_ks" target="_blank" rel="noreferrer" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', transition: 'transform 0.3s' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                  <a href="https://wa.me/97470294134" target="_blank" rel="noreferrer" style={{ color: '#25D366', display: 'flex', alignItems: 'center', transition: 'transform 0.3s' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133-.298-.347-.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                  <a href="https://instagram.com/aafin_ks" target="_blank" rel="noreferrer" style={{ color: '#E1306C', display: 'flex', alignItems: 'center', transition: 'transform 0.3s' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                </div>
              </motion.div>

              {/* Info Column (Right Column) */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ flex: '1', minWidth: '300px', maxWidth: '600px', position: 'relative' }}
              >
                {/* Glowing orb behind text */}
                <div style={{ position: 'absolute', top: '-100px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: -1 }}></div>

                <motion.h1 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', lineHeight: '1.1', marginBottom: '1.5rem', textTransform: 'uppercase' }}
                >
                  <motion.span variants={wordVariants} style={{ display: 'inline-block', marginRight: '1rem', color: 'var(--accent)', textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>AI</motion.span>
                  <motion.span variants={wordVariants} style={{ display: 'inline-block', marginRight: '1rem' }}>DIGITAL</motion.span>
                  <motion.span variants={wordVariants} style={{ display: 'inline-block', marginRight: '1rem' }}>MARKETING</motion.span>
                  <motion.span variants={wordVariants} style={{ display: 'block', color: 'var(--text-secondary)' }}>EXPERT</motion.span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '500px' }}
                >
                  {profile.bio}
                </motion.p>

                <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                      +<AnimatedCounter from={0} to={profile.years_experience} duration={1.5} />
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Years of<br/>Experience
                    </p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                      +<AnimatedCounter from={0} to={profile.projects_completed} duration={2} />
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Projects<br/>Completed
                    </p>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                      +<AnimatedCounter from={0} to={profile.loyal_clients} duration={1.8} />
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Loyal<br/>Clients
                    </p>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}
                >
                  <Link to="/services" className="btn btn-primary" style={{ background: 'var(--accent)', color: '#fff' }}>
                    View Services
                  </Link>
                  <Link to="/contact" className="btn btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                    Contact Me
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Experience Section */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '6rem 0', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ marginBottom: '4rem' }}
          >
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>Professional Experience</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {profile.experience && profile.experience.filter(exp => exp.is_visible !== false).map((exp, index) => (
                <motion.div key={index} className="glass-panel" whileHover={{ x: 10, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{exp.title}</h3>
                  <p style={{ color: 'var(--accent)', fontWeight: '600', marginBottom: '1rem' }}>{exp.company}</p>
                  <ul style={{ color: 'var(--text-secondary)', listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {exp.tasks && exp.tasks.map((task, tIndex) => (
                      <li key={tIndex}>{task}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Skills Section */}
      <section style={{ padding: '6rem 0', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Key Skills & Expertise</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: '900px', margin: '0 auto' }}>
              {profile.skills && profile.skills.map((skill, index) => {
                const isVisible = typeof skill === 'string' ? true : skill.is_visible;
                if (isVisible === false) return null;
                const skillName = typeof skill === 'string' ? skill : skill.name;
                return (
                <motion.span 
                  key={index} 
                  whileHover={{ scale: 1.1, backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '50px',
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    cursor: 'default',
                    transition: 'all 0.3s ease'
                  }}>
                  {skillName}
                </motion.span>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Home Image Gallery */}
      {homeImages.length > 0 && (
        <GallerySection homeImages={homeImages} setSelectedImage={setSelectedImage} navigate={navigate} />
      )}

      <style>{`
        .hover-overlay {
          opacity: 0;
        }
        div:hover > .hover-overlay {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

// Extracted Gallery Section with Pagination
const GallerySection = ({ homeImages, setSelectedImage, navigate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 20;

  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = homeImages.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(homeImages.length / imagesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '6rem 0', position: 'relative', zIndex: 10 }}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center', color: 'var(--accent)' }}>Gallery</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '1.5rem'
          }}>
            {currentImages.map((img, idx) => (
              <motion.div 
                key={img.id}
                onClick={() => {
                  if (img.link_url) {
                    navigate(img.link_url);
                  } else {
                    setSelectedImage(img.image_url);
                  }
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                style={{
                  aspectRatio: '1/1',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: img.link_url ? 'pointer' : 'zoom-in',
                  position: 'relative'
                }}
              >
                <img 
                  src={img.image_url} 
                  alt="Gallery" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {img.link_url && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }} className="hover-overlay">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3rem', gap: '1rem' }}>
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                style={{ 
                  padding: '0.8rem 1.5rem', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'var(--accent)', 
                  color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#000',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
              >
                &larr; Previous
              </button>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                style={{ 
                  padding: '0.8rem 1.5rem', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'var(--accent)', 
                  color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#000',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Home;
