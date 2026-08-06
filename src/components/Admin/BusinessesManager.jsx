import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableRow } from './SortableRow';

const BusinessesManager = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ id: '', name: '', location: '', logo_url: '' });
  const [uploading, setUploading] = useState(false);

  const fetchBusinesses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('businesses').select('*').order('order_index', { ascending: true }).order('id');
    if (!error) setBusinesses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const toggleVisibility = async (business) => {
    const { error } = await supabase
      .from('businesses')
      .update({ is_visible: !business.is_visible })
      .eq('id', business.id);
    
    if (!error) fetchBusinesses();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business?')) return;
    const { error } = await supabase.from('businesses').delete().eq('id', id);
    if (!error) fetchBusinesses();
  };

  const handleEdit = (business) => {
    setFormData({
      id: business.id,
      name: business.name || '',
      location: business.location || '',
      logo_url: business.logo_url || ''
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-media')
      .upload(fileName, file);

    if (uploadError) {
      alert('Error uploading file: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('portfolio-media')
      .getPublicUrl(fileName);

    setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
    setUploading(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      location: formData.location,
      logo_url: formData.logo_url
    };

    let error;
    if (isEditing) {
      const res = await supabase.from('businesses').update(payload).eq('id', formData.id);
      error = res.error;
    } else {
      const res = await supabase.from('businesses').insert([payload]);
      error = res.error;
    }

    if (!error) {
      setIsAdding(false);
      setIsEditing(false);
      setFormData({ id: '', name: '', location: '', logo_url: '' });
      fetchBusinesses();
    } else {
      alert(error.message);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = businesses.findIndex((item) => item.id === active.id);
      const newIndex = businesses.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(businesses, oldIndex, newIndex);
      setBusinesses(newOrder);

      const updates = newOrder.map((business, index) => ({
        id: business.id,
        order_index: index
      }));
      
      for (const update of updates) {
        await supabase.from('businesses').update({ order_index: update.order_index }).eq('id', update.id);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Businesses</h2>
        <button 
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setIsEditing(false);
              setFormData({ id: '', name: '', location: '', logo_url: '' });
            } else {
              setIsAdding(true);
            }
          }}
          style={{ background: 'var(--accent)', color: '#000', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isAdding ? 'Cancel' : '+ Add Business'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
          <div style={{ width: '100%', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Logo Uploader</h4>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Upload Business Logo</label>
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} style={{ color: '#fff' }} />
              {formData.logo_url && <p style={{ color: '#34c759', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ Logo Ready</p>}
              {uploading && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: '1rem' }}>Uploading...</p>}
            </div>
          </div>
          
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Business Name</label>
            <input 
              required type="text" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Location</label>
            <input 
              required type="text" 
              value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div style={{ width: '100%', marginTop: '1rem' }}>
            <button type="submit" disabled={uploading} style={{ background: 'var(--accent)', color: '#000', padding: '0.8rem 2rem', borderRadius: '4px', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {isEditing ? 'Save Changes' : 'Save Business'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading businesses...</p>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent)' }}>
                <th style={{ padding: '1rem', width: '40px' }}></th>
                <th style={{ padding: '1rem' }}>Logo</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Location</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={businesses.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {businesses.map(business => (
                    <SortableRow key={business.id} id={business.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        {business.logo_url && <img src={business.logo_url} alt={business.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: '#fff' }} />}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{business.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{business.location}</td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          onClick={() => toggleVisibility(business)}
                          title={business.is_visible ? "Hide Business" : "Show Business"}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: business.is_visible ? '#34c759' : '#ff3b30', display: 'flex', alignItems: 'center', padding: '0.5rem' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {business.is_visible ? (
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
                        <button 
                          onClick={() => handleEdit(business)}
                          style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(business.id)}
                          style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </SortableRow>
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      )}
    </div>
  );
};

export default BusinessesManager;
