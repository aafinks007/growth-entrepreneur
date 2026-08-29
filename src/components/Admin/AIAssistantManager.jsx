import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Upload, MessageSquare, Clock, ImageIcon, Trash2 } from 'lucide-react';

const AIAssistantManager = () => {
  const [settings, setSettings] = useState({ avatar_url: '', waving_avatar_url: '' });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching settings:', settingsError);
      } else if (settingsData) {
        setSettings(settingsData);
      }

      // Fetch logs
      const { data: logsData, error: logsError } = await supabase
        .from('ai_chat_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (event, type) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const updatePayload = type === 'avatar' 
        ? { avatar_url: publicUrl } 
        : { waving_avatar_url: publicUrl };

      const { error: updateError } = await supabase
        .from('ai_settings')
        .update(updatePayload)
        .eq('id', 1);

      if (updateError) throw updateError;
      
      setSettings(prev => ({ ...prev, ...updatePayload }));
      alert('Avatar updated successfully!');
    } catch (error) {
      alert('Error uploading image!');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm('Are you sure you want to delete all chat logs?')) return;
    try {
      const { error } = await supabase.from('ai_chat_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setLogs([]);
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('Error clearing logs');
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>Loading AI Data...</div>;

  return (
    <div style={{ color: '#fff' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquare color="var(--accent)" />
        AI Assistant Management
      </h2>

      <div className="admin-ai-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Chat Avatar (Close-up)</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={settings.avatar_url || '/aafin-avatar.jpg'} 
              alt="Avatar" 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} 
            />
            <div>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff',
                borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem'
              }}>
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Change Picture'}
                <input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'avatar')} disabled={uploading} style={{ display: 'none' }} />
              </label>
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>Used inside the chat window.</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Tooltip Avatar (Waving)</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={settings.waving_avatar_url || '/aafin-avatar-waving.jpg'} 
              alt="Waving Avatar" 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} 
            />
            <div>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff',
                borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem'
              }}>
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Change Picture'}
                <input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'waving')} disabled={uploading} style={{ display: 'none' }} />
              </label>
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>Used for the homepage greeting.</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--accent)" />
          Recent Conversations (Total: {new Set(logs.map(l => l.session_id)).size})
        </h3>
        <button onClick={clearLogs} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <Trash2 size={16} /> Clear Logs
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {logs.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            No chat logs found yet. When someone asks the AI a question, it will appear here!
          </p>
        ) : (
          Array.from(new Set(logs.map(l => l.session_id))).map(sessionId => {
            const sessionLogs = logs.filter(l => l.session_id === sessionId).reverse();
            return (
              <div key={sessionId} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                  <span><strong style={{ color: '#fff' }}>Session ID:</strong> {sessionId}</span>
                  <span>{sessionLogs.length} messages</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sessionLogs.map(log => (
                    <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ alignSelf: 'flex-end', maxWidth: '80%', background: 'rgba(59, 130, 246, 0.15)', padding: '1rem', borderRadius: '12px 12px 0 12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.25rem', textAlign: 'right' }}>{new Date(log.created_at).toLocaleTimeString()}</div>
                        <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {log.has_image && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}><ImageIcon size={12} /></span>}
                          {log.user_message || '(No text provided)'}
                        </div>
                      </div>

                      <div style={{ alignSelf: 'flex-start', maxWidth: '80%', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px 12px 12px 0', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginBottom: '0.25rem' }}>Aafin</div>
                        <div style={{ color: '#e0e0e0', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{log.ai_response}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AIAssistantManager;
