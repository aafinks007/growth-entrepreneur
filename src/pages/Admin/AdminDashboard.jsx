import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import ProjectsManager from '../../components/Admin/ProjectsManager';
import ClientsManager from '../../components/Admin/ClientsManager';
import BusinessesManager from '../../components/Admin/BusinessesManager';
import CategoriesManager from '../../components/Admin/CategoriesManager';
import ProfileManager from '../../components/Admin/ProfileManager';
import HomeImagesManager from '../../components/Admin/HomeImagesManager';

const AdminDashboard = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showBusinesses, setShowBusinesses] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin');
      } else {
        setSession(session);
      }
      
      const { data } = await supabase.from('settings').select('value').eq('key', 'show_businesses').single();
      if (data) {
        setShowBusinesses(data.value);
      }

      setLoading(false);
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const toggleBusinessFeatureVisibility = async (e) => {
    e.stopPropagation(); // prevent clicking the tab
    const newValue = !showBusinesses;
    setShowBusinesses(newValue);
    await supabase.from('settings').update({ value: newValue }).eq('key', 'show_businesses');
  };

  if (loading) return <div style={{ paddingTop: '140px', textAlign: 'center', color: 'var(--accent)' }}>Loading Secure Portal...</div>;
  if (!session) return null;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h3 style={{ color: 'var(--accent)', marginBottom: '2rem' }}>Admin Portal</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('profile')}
            style={{
              background: activeTab === 'profile' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              padding: '1rem',
              color: '#fff',
              textAlign: 'left',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
          >
            Manage Profile (Home)
          </button>
          <button 
            onClick={() => setActiveTab('home_images')}
            style={{
              background: activeTab === 'home_images' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              padding: '1rem',
              color: '#fff',
              textAlign: 'left',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
          >
            Home Gallery Images
          </button>
          
          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

          <button 
            onClick={() => setActiveTab('projects')}
            style={{
              background: activeTab === 'projects' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              padding: '1rem',
              color: '#fff',
              textAlign: 'left',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
          >
            Manage Projects
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            style={{
              background: activeTab === 'categories' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              padding: '1rem',
              color: '#fff',
              textAlign: 'left',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
          >
            Manage Categories
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            style={{
              background: activeTab === 'clients' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              padding: '1rem',
              color: '#fff',
              textAlign: 'left',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
          >
            Manage Clients
          </button>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => setActiveTab('businesses')}
              style={{
                flex: 1,
                background: activeTab === 'businesses' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                padding: '1rem',
                color: '#fff',
                textAlign: 'left',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              Manage Businesses
            </button>
            <button
              onClick={toggleBusinessFeatureVisibility}
              title={showBusinesses ? "Hide feature from public menu" : "Show feature in public menu"}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: showBusinesses ? '#34c759' : '#ff3b30',
                padding: '0.5rem'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showBusinesses ? (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </>
                ) : (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 59, 48, 0.5)',
            padding: '1rem',
            color: '#ff3b30',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.3s',
            marginTop: 'auto'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {activeTab === 'profile' && <ProfileManager />}
        {activeTab === 'home_images' && <HomeImagesManager />}
        {activeTab === 'projects' && <ProjectsManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'clients' && <ClientsManager />}
        {activeTab === 'businesses' && <BusinessesManager />}
      </div>
    </div>
  );
};

export default AdminDashboard;
