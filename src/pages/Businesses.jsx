import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_visible', true)
        .order('order_index', { ascending: true })
        .order('id');
      
      if (!error) {
        setBusinesses(data);
      } else {
        console.error('Error fetching businesses:', error);
      }
      setLoading(false);
    };

    fetchBusinesses();
  }, []);

  return (
    <div style={{ paddingTop: '140px' }}>
      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h1 style={{ marginBottom: '1rem' }}>Business Collaborations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            Empowering businesses to scale with AI-driven digital marketing. 
            I'm always open to strategic partnerships and B2B collaborations.
          </p>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--accent)', marginBottom: '4rem' }}>Loading businesses...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto 4rem auto'
          }}>
            {businesses.map((business, index) => (
              <Link to={`/businesses/${business.id}`} key={business.id || index} style={{ display: 'block' }}>
                <motion.div
                  className="glass-panel"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '160px',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.02)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    {business.logo_url && (
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        background: '#fff', 
                        padding: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                      }}>
                        <img 
                          src={business.logo_url} 
                          alt={business.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.3rem', color: '#fff', letterSpacing: '0.5px' }}>{business.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>{business.location}</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <motion.div
            className="glass-panel"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Strategic Partnerships</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Are you an agency or a business looking to integrate cutting-edge AI marketing services? 
              Let's collaborate to bring exceptional value to your clients.
            </p>
          </motion.div>

          <motion.div
            className="glass-panel"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>B2B Services</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              From full-scale digital transformation to AI agents deployment, I provide robust solutions 
              designed specifically for business growth and automation.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(23, 23, 23, 0.8))',
            border: '1px solid var(--accent)',
            borderRadius: '24px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.15)'
          }}
        >
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Interested in Collaborating?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            Whether you have a project in mind, need a white-label partner, or want to discuss a joint venture, 
            I'd love to hear from you. Let's build something great together.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <a href="mailto:your.email@example.com" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Email for Partnership
            </a>
            <a href="https://wa.me/97470294134" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', borderColor: '#25D366', color: '#25D366' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              WhatsApp Me
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Businesses;
