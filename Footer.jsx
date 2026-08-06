import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
const Footer = () => {
  return (
    <footer>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ flex: '1', minWidth: '250px' }}>
            <Link to="/" className="logo" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <img src="/aafin logo.jpg.png" alt="Aafin K S Logo" style={{ height: '60px', display: 'block', borderRadius: '8px' }} />
            </Link>
            <p style={{ color: 'var(--text-secondary)' }}>
              Elevating brands through data-driven AI digital marketing strategies.
            </p>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}
               onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
               onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              Instagram
            </a>
            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}
               onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
               onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              LinkedIn
            </a>
            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}
               onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
               onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              Behance
            </a>
            <a href="https://wa.me/919847510085" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}
               onMouseEnter={(e) => e.target.style.color = '#25D366'}
               onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
