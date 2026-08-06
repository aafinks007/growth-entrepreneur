import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import servicesDetails from '../data/servicesDetails.json';

const ServiceDetail = () => {
  const { slug } = useParams();
  
  const service = servicesDetails.find(s => s.slug === slug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div style={{ paddingTop: '140px', minHeight: '80vh' }}>
      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
        >
          <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', transition: 'color 0.3s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Services
          </Link>
          
          <h1 style={{ marginBottom: '1rem', color: 'var(--accent)', fontSize: '3rem' }}>{service.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>
            {service.category}
          </p>
        </motion.div>

        <motion.div
          className="glass-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem', textAlign: 'left' }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Overview</h2>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '3rem' }}>
            {service.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>Key Features</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {service.features.map((feature, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: 'var(--text-secondary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>Benefits</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                {service.benefits}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '4rem', textAlign: 'center', paddingTop: '3rem', borderTop: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Ready to get started?</h3>
            <Link to="/contact" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 3rem' }}>
              Contact Me
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ServiceDetail;
