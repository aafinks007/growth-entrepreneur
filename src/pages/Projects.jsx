import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Projects = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('project_categories')
        .select('*')
        .eq('is_visible', true)
        .order('order_index', { ascending: true })
        .order('id');
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data);
      }
      setLoading(false);
    };
    
    fetchCategories();
  }, []);

  return (
    <div style={{ paddingTop: '140px' }}>
      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h1 style={{ marginBottom: '1rem' }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            A showcase of my recent projects across web development, digital marketing, and creative media.
          </p>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--accent)' }}>Loading projects...</div>
        ) : (
          <div className="projects-grid">
            {categories.map((project, index) => {
              const cardContent = (
                <motion.div
                  key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  aspectRatio: '4/3',
                  cursor: 'pointer',
                  display: 'block'
                }}
                className="project-card"
              >
                {project.video ? (
                  <video 
                    src={project.video}
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
                      backgroundImage: `url(${project.image})`,
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
                  <h3 style={{ color: '#fff', margin: 0 }}>{project.title}</h3>
                </div>
              </motion.div>
            );

            return (
              <Link to={`/projects/${project.slug}`} key={project.id} style={{ display: 'block' }}>
                {cardContent}
              </Link>
            );
          })}
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

export default Projects;
