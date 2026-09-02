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
                onClick={(e) => e.stopPropagation()} 
              />
            ) : selectedMedia.type === 'document' ? (
              <div style={{ width: '90%', height: '90%', background: '#fff', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Document Viewer</h3>
                  <a 
                    href={selectedMedia.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ background: 'var(--accent)', color: '#000', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
                  >
                    Open Full PDF ↗
                  </a>
                </div>
                <iframe 
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedMedia.url)}&embedded=true`} 
                  style={{ width: '100%', flex: 1, border: 'none' }}
                  title="Document Viewer"
                />
              </div>
            ) : selectedMedia.type === 'website' ? (
              <div style={{ width: '90%', height: '90%', background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: '#f1f1f1', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                  </div>
                  <div style={{ background: '#fff', padding: '0.25rem 1rem', borderRadius: '16px', fontSize: '0.85rem', color: '#555', flex: 1, textAlign: 'center', margin: '0 2rem' }}>
                    {selectedMedia.url}
                  </div>
                  <a href={selectedMedia.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#0066cc', textDecoration: 'none', fontWeight: 'bold' }}>Open in new tab ↗</a>
                </div>
                <iframe 
                  src={selectedMedia.url} 
                  style={{ width: '100%', flex: 1, border: 'none' }}
                />
              </div>
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
                    if (item.website_link) {
                      setSelectedMedia({ url: item.website_link, type: 'website' });
                    } else if (item.video) {
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
                  ) : item.image ? (
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
                  ) : item.document ? (
                    <div 
                      className="project-image"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        transition: 'transform 0.5s ease',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <span style={{ color: '#fff', fontWeight: '500', fontSize: '1.1rem' }}>View PDF Document</span>
                    </div>
                  ) : item.website_link ? (
                    <div 
                      className="project-image"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        transition: 'transform 0.5s ease',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      <span style={{ color: '#fff', fontWeight: '500', fontSize: '1.1rem' }}>Visit Live Website</span>
                    </div>
                  ) : (
                    <div className="project-image" style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)' }} />
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
                    <h3 style={{ color: '#fff', margin: 0 }}>{item.title}</h3>
                    
                    {/* Media Type Badges */}
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                      {item.website_link && (
                        <div style={{ background: 'var(--accent)', color: '#000', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line></svg>
                          Live Site
                        </div>
                      )}
                      {item.document && !item.website_link && (
                        <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                          PDF
                        </div>
                      )}
                      {item.video && !item.document && !item.website_link && (
                        <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          Video
                        </div>
                      )}
                    </div>
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
