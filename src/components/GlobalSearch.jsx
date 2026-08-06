import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    projects: [],
    categories: [],
    clients: [],
    businesses: []
  });
  const [loading, setLoading] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({ projects: [], categories: [], clients: [], businesses: [] });
        return;
      }

      setLoading(true);
      const searchTerm = `%${query}%`;

      try {
        // Fetch Projects
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, title, category_id, slug, image')
          .ilike('title', searchTerm)
          .eq('is_visible', true)
          .limit(5);

        // Fetch Categories (Services)
        const { data: categoriesData } = await supabase
          .from('project_categories')
          .select('id, title, slug, image')
          .ilike('title', searchTerm)
          .eq('is_visible', true)
          .limit(5);

        // Fetch Clients
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, name, location, logo_url')
          .or(`name.ilike.${searchTerm},location.ilike.${searchTerm}`)
          .eq('is_visible', true)
          .limit(5);

        // Fetch Businesses
        const { data: businessesData } = await supabase
          .from('businesses')
          .select('id, name, location, logo_url')
          .or(`name.ilike.${searchTerm},location.ilike.${searchTerm}`)
          .eq('is_visible', true)
          .limit(5);

        setResults({
          projects: projectsData || [],
          categories: categoriesData || [],
          clients: clientsData || [],
          businesses: businessesData || []
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const hasResults = Object.values(results).some(arr => arr.length > 0);

  return (
    <>
      {/* Fixed Search Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="search-float"
        aria-label="Search across website"
      >
        <Search size={24} />
      </button>

      {/* Full Screen Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(10, 10, 10, 0.65)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem 1rem'
            }}
          >
            <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Header: Input & Close */}
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <Search size={22} color="var(--accent)" style={{ marginRight: '1rem' }} />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Search projects, clients, services..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                    outline: 'none',
                    fontWeight: '400'
                  }}
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={26} />
                </button>
              </div>

              {/* Results Container */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }} className="search-results-scrollbar">
                
                {!query.trim() && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem', fontSize: '1.2rem' }}>
                    Type something to start searching...
                  </div>
                )}

                {query.trim() && loading && (
                  <div style={{ textAlign: 'center', color: 'var(--accent)', marginTop: '4rem', fontSize: '1.2rem' }}>
                    Searching...
                  </div>
                )}

                {query.trim() && !loading && !hasResults && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem', fontSize: '1.2rem' }}>
                    No results found for "{query}"
                  </div>
                )}

                {query.trim() && !loading && hasResults && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Services/Categories */}
                    {results.categories.length > 0 && (
                      <div>
                        <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Services / Categories</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {results.categories.map(cat => (
                            <Link 
                              to={`/projects/${cat.slug}`} 
                              key={cat.id} 
                              onClick={() => setIsOpen(false)}
                              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'background 0.2s' }}
                              className="search-result-item"
                            >
                              {cat.image ? (
                                <img src={cat.image} alt={cat.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                              ) : (
                                <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={20} /></div>
                              )}
                              <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>{cat.title}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {results.projects.length > 0 && (
                      <div>
                        <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Projects</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {results.projects.map(project => (
                            <div
                              key={project.id} 
                              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'default' }}
                            >
                              {project.image ? (
                                <img src={project.image} alt={project.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                              ) : (
                                <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={20} /></div>
                              )}
                              <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>{project.title}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Project Media</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clients */}
                    {results.clients.length > 0 && (
                      <div>
                        <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Clients</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {results.clients.map(client => (
                            <Link 
                              to={`/clients/${client.id}`} 
                              key={client.id} 
                              onClick={() => setIsOpen(false)}
                              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'background 0.2s' }}
                              className="search-result-item"
                            >
                              {client.logo_url ? (
                                <img src={client.logo_url} alt={client.name} style={{ width: '50px', height: '50px', objectFit: 'contain', background: '#fff', borderRadius: '8px', padding: '4px' }} />
                              ) : (
                                <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={20} /></div>
                              )}
                              <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>{client.name}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{client.location}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Businesses */}
                    {results.businesses.length > 0 && (
                      <div>
                        <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Businesses</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {results.businesses.map(business => (
                            <Link 
                              to={`/businesses/${business.id}`} 
                              key={business.id} 
                              onClick={() => setIsOpen(false)}
                              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'background 0.2s' }}
                              className="search-result-item"
                            >
                              {business.logo_url ? (
                                <img src={business.logo_url} alt={business.name} style={{ width: '50px', height: '50px', objectFit: 'contain', background: '#fff', borderRadius: '8px', padding: '4px' }} />
                              ) : (
                                <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={20} /></div>
                              )}
                              <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>{business.name}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{business.location}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalSearch;
