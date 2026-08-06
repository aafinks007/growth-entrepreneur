import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ProjectCategory = () => {
  const { slug } = useParams();
  
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null); // For Lightbox { url, type }

  useEffect(() => {
    const fetchCategoryAndProjects = async () => {
      const { data: catData, error: catError } = await supabase
        .from('project_categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (catError || !catData) {
        setError(true);
        setLoading(false);
        return;
      }

      const { data: projData, error: projError } = await supabase
        .from('projects')
        .select('*')
        .eq('category_id', catData.id)
        .eq('is_visible', true)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (!projError) {
        catData.items = projData;
      } else {
        catData.items = [];
      }
      
      setCategory(catData);
      setLoading(false);
    };

    fetchCategoryAndProjects();
  }, [slug]);

  if (loading) {
    return <div style={{ paddingTop: '140px', textAlign: 'center', color: 'var(--accent)', minHeight: '80vh' }}>Loading projects...</div>;
  }

  if (error || !category) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div style={{ paddingTop: '140px', minHeight: '80vh' }}>
      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', transition: 'color 0.3s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Categories
          </Link>
          <h1 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>{category.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Explore projects within {category.title}
          </p>
        </motion.div>

        {/* Universal Media Lightbox */}
        {selectedMedia && (
          <div 
            onClick={() => setSelectedMedia(null)}
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
            {selectedMedia.type === 'video' ? (
              <video 
                src={selectedMedia.url} 
                controls
                autoPlay
                style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '8px', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking video controls
              />
            ) : selectedMedia.type === 'document' ? (
              <iframe 
                src={selectedMedia.url} 
                style={{ width: '90%', height: '90%', borderRadius: '8px', border: 'none', background: '#fff' }}
              />
            ) : (
              <img 
                src={selectedMedia.url} 
                alt="Full Screen" 
                style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}
              />
            )}
          </div>
        )}

        {category.items && category.items.length > 0 ? (
          <div className="projects-grid">
            {category.items.map((item, index) => {
              const cardContent = (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => {
                    if (item.video) {
                      setSelectedMedia({ url: item.video, type: 'video' });
                    } else if (item.document) {
                      setSelectedMedia({ url: item.document, type: 'document' });
                    } else if (item.image) {
                      setSelectedMedia({ url: item.image, type: 'image' });
                    }
                  }}
                  style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    aspectRatio: category.slug === 'video-marketing' ? '9/16' : '4/3',
                    cursor: 'zoom-in',
                    display: 'block'
                  }}
                  className="project-card"
                >
                  {item.video ? (
                    <video 
                      src={item.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                      className="project-image"
                    />
                  ) : (
                    <div 
                      style={{ 
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.5s ease',
                      }}
                      className="project-image"
                    />
                  )}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '2rem',
                      opacity: 1,
                      transition: 'opacity 0.3s ease'
                    }}
                    className="project-overlay"
                  >
                    <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ color: 'var(--accent)' }}>{item.category || category.category}</p>
                  </div>
                </motion.div>
              );

              return (
                <div key={item.id} style={{ display: 'block' }}>
                  {cardContent}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
            <p>More projects coming soon!</p>
          </div>
        )}
      </section>
      <style>{`
        .project-card:hover .project-image {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default ProjectCategory;
