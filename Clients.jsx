import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_visible', true)
        .order('order_index', { ascending: true })
        .order('id');
      
      if (!error) {
        setClients(data);
      } else {
        console.error('Error fetching clients:', error);
      }
      setLoading(false);
    };

    fetchClients();
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
          <h1 style={{ marginBottom: '1rem' }}>Trusted By</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            I have had the pleasure of working with diverse clients ranging from startups to established enterprises in Qatar and globally.
          </p>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--accent)' }}>Loading clients...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {clients.map((client, index) => (
              <Link to={`/clients/${client.id}`} key={client.id || index} style={{ display: 'block' }}>
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
                    {client.logo_url && (
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
                          src={client.logo_url} 
                          alt={client.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.3rem', color: '#fff', letterSpacing: '0.5px' }}>{client.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>{client.location}</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ marginTop: '6rem', textAlign: 'center' }}
        >
          <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '1rem' }}>"</div>
            <p style={{ fontSize: '1.5rem', fontStyle: 'italic', marginBottom: '2rem' }}>
              "Aafin delivered exactly what we needed. The website is stunning, and the new ad campaigns have boosted our leads by 200%. Highly recommended professional."
            </p>
            <h4 style={{ color: 'var(--accent)' }}>- Qfit Gym</h4>
            <span style={{ color: 'var(--text-secondary)' }}>Qatar</span>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Clients;
