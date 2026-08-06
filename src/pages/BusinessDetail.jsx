import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const BusinessDetail = () => {
  const { id } = useParams();
  
  const [business, setBusiness] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBusinessAndProjects = async () => {
      // Fetch the business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .eq('is_visible', true)
        .single();
      
      if (businessError || !businessData) {
        setError(true);
        setLoading(false);
        return;
      }

      setBusiness(businessData);

      // Fetch the projects belonging to this business
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .select('*, project_categories(title)')
        .eq('business_id', id)
        .eq('is_visible', true);

      if (!projError && projData) {
        setProjects(projData);
      }
      
      setLoading(false);
    };

    fetchBusinessAndProjects();
  }, [id]);

  if (loading) {
    return <div style={{ paddingTop: '140px', textAlign: 'center', color: 'var(--accent)', minHeight: '80vh' }}>Loading business details...</div>;
  }

  if (error || !business) {
    return <Navigate to="/businesses" replace />;
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
          <Link to="/businesses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', transition: 'color 0.3s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Businesses
          </Link>
          <h1 style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>{business.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            {business.location}
          </p>
        </motion.div>

        {projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map((item, index) => {
              const cardContent = (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    aspectRatio: item.project_categories?.slug === 'video-marketing' ? '9/16' : '4/3',
                    cursor: item.link ? 'pointer' : 'default',
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
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.5s ease',
                      }}
                      className="project-image"
                    >
                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)' }} className="project-image" />
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
                    <p style={{ color: 'var(--accent)' }}>{item.category || item.project_categories?.title}</p>
                  </div>
                </motion.div>
              );

              if (item.document) {
                return (
                  <a href={item.document} target="_blank" rel="noreferrer" key={item.id} style={{ display: 'block' }}>
                    {cardContent}
                  </a>
                );
              }

              return item.link ? (
                <a href={item.link} target="_blank" rel="noreferrer" key={item.id} style={{ display: 'block' }}>
                  {cardContent}
                </a>
              ) : (
                <div key={item.id} style={{ display: 'block' }}>
                  {cardContent}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
            <p>No public projects assigned to this business yet.</p>
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

export default BusinessDetail;
