import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Briefcase, Users, Building, MessageSquare, ArrowRight } from 'lucide-react';

const OverviewDashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    projects: 0,
    clients: 0,
    businesses: 0,
    aiChats: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projRes, clientRes, busRes, aiRes] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('clients').select('*', { count: 'exact', head: true }),
          supabase.from('businesses').select('*', { count: 'exact', head: true }),
          supabase.from('ai_chat_logs').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          projects: projRes.count || 0,
          clients: clientRes.count || 0,
          businesses: busRes.count || 0,
          aiChats: aiRes.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, count, icon, tab, color }) => (
    <div 
      className="glass-panel" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        background: 'rgba(255,255,255,0.03)',
        borderTop: `4px solid ${color}`,
        cursor: 'pointer'
      }}
      onClick={() => setActiveTab(tab)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ccc' }}>{title}</h3>
        <div style={{ background: `${color}20`, padding: '0.75rem', borderRadius: '50%', display: 'flex' }}>
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
          {loading ? '...' : count}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: color, fontSize: '0.85rem', fontWeight: '600' }}>
          Manage <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#fff' }}>Welcome back, Admin</h2>
      <p style={{ color: '#888', marginBottom: '2.5rem' }}>Here is what is happening with your portfolio today.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard 
          title="Total Projects" 
          count={stats.projects} 
          icon={<Briefcase size={24} color="#3b82f6" />} 
          tab="projects" 
          color="#3b82f6"
        />
        <StatCard 
          title="Total Clients" 
          count={stats.clients} 
          icon={<Users size={24} color="#10b981" />} 
          tab="clients" 
          color="#10b981"
        />
        <StatCard 
          title="Active Businesses" 
          count={stats.businesses} 
          icon={<Building size={24} color="#f59e0b" />} 
          tab="businesses" 
          color="#f59e0b"
        />
        <StatCard 
          title="AI Conversations" 
          count={stats.aiChats} 
          icon={<MessageSquare size={24} color="#8b5cf6" />} 
          tab="ai_assistant" 
          color="#8b5cf6"
        />
      </div>
      
      <div style={{ marginTop: '3rem', background: 'rgba(59, 130, 246, 0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Quick Tips</h3>
        <ul style={{ color: '#ccc', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem' }}>
          <li>Check the <strong>AI Assistant Logs</strong> to see what prospective clients are asking about your services.</li>
          <li>Reorder your <strong>Projects</strong> by dragging and dropping them to control what shows up first on the homepage.</li>
          <li>Keep your <strong>Home Gallery Images</strong> updated with your best work to maintain a strong first impression.</li>
        </ul>
      </div>
    </div>
  );
};

export default OverviewDashboard;
