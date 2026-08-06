import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const servicesList = [
  {
    category: "Websites",
    items: [
      { name: "Invitation Website", slug: "invitation-website" },
      { name: "Portfolio Website", slug: "portfolio-website" },
      { name: "Standard Business Site", slug: "standard-business-site" },
      { name: "Ecommerce Platform", slug: "ecommerce-platform" },
      { name: "AI Agents", slug: "ai-agents" }
    ],
    icon: "🌐"
  },
  {
    category: "Advertising",
    items: [
      { name: "Meta Ads (FB & IG)", slug: "meta-ads" },
      { name: "Google Ads", slug: "google-ads" },
      { name: "Tiktok Ads", slug: "tiktok-ads" },
      { name: "Snapchat Ads", slug: "snapchat-ads" }
    ],
    icon: "📈"
  },
  {
    category: "SEO",
    items: [
      { name: "On-page Optimization", slug: "on-page-optimization" },
      { name: "Off-page Optimization", slug: "off-page-optimization" },
      { name: "Blogs Writing", slug: "blogs-writing" },
      { name: "Google My Business", slug: "google-my-business" }
    ],
    icon: "🔍"
  },
  {
    category: "Branding & Media",
    items: [
      { name: "Content Creation", slug: "content-creation" },
      { name: "Influencer Marketing", slug: "influencer-marketing" },
      { name: "Social Media Management", slug: "social-media-management" },
      { name: "Posters & Reels", slug: "posters-and-reels" },
      { name: "Professional Photography", slug: "professional-photography" },
      { name: "Cinematic Videography", slug: "cinematic-videography" }
    ],
    icon: "🎬"
  }
];

const Services = () => {
  return (
    <div style={{ paddingTop: '140px' }}>
      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h1 style={{ marginBottom: '1rem' }}>My Services</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Comprehensive digital services tailored for your brand's growth and success. 
            All services are professionally managed with transparent pricing.
          </p>
        </motion.div>

        <div className="services-grid">
          {servicesList.map((service, index) => (
            <motion.div
              key={service.category}
              className="glass-panel"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{service.icon}</div>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>{service.category}</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {service.items.map((item, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    <Link to={`/services/${item.slug}`} className="btn btn-primary" style={{ padding: '0.3rem 1rem', fontSize: '0.8rem' }}>View</Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Services;
