import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableRow } from './SortableRow';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ id: '', title: '', category: '', image: '', video: '', slug: '' });

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('project_categories').select('*').order('order_index', { ascending: true }).order('id');
    if (!error) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleVisibility = async (cat) => {
    const { error } = await supabase
      .from('project_categories')
      .update({ is_visible: !cat.is_visible })
      .eq('id', cat.id);
    
    if (!error) fetchCategories();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All projects in this category will become uncategorized.')) return;
    const { error } = await supabase.from('project_categories').delete().eq('id', id);
    if (!error) fetchCategories();
  };

  const handleEdit = (cat) => {
    setFormData({
      id: cat.id,
      title: cat.title || '',
      category: cat.category || '',
      image: cat.image || '',
      video: cat.video || '',
      slug: cat.slug || ''
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleFileUpload = async (e, type) => {
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

    if (type === 'video') {
      setFormData(prev => ({ ...prev, video: data.publicUrl }));
    } else {
      setFormData(prev => ({ ...prev, image: data.publicUrl }));
    }
    
    setUploading(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-generate slug if not provided
    let finalSlug = formData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!finalSlug && formData.title) {
        finalSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    const payload = {
      title: formData.title,
      category: formData.category,
      image: formData.image,
      video: formData.video,
      slug: finalSlug
    };

    let error;
    if (isEditing) {
      const res = await supabase.from('project_categories').update(payload).eq('id', formData.id);
      error = res.error;
    } else {
      const res = await supabase.from('project_categories').insert([payload]);
      error = res.error;
    }

    if (!error) {
      setIsAdding(false);
      setIsEditing(false);
      setFormData({ id: '', title: '', category: '', image: '', video: '', slug: '' });
      fetchCategories();
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
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(categories, oldIndex, newIndex);
      setCategories(newOrder);

      const updates = newOrder.map((cat, index) => ({
        id: cat.id,
        order_index: index
      }));
      
      for (const update of updates) {
        await supabase.from('project_categories').update({ order_index: update.order_index }).eq('id', update.id);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Categories</h2>
        <button 
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setIsEditing(false);
              setFormData({ id: '', title: '', category: '', image: '', video: '', slug: '' });
            } else {
              setIsAdding(true);
            }
          }}
          style={{ background: 'var(--accent)', color: '#000', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isAdding ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
          <div style={{ width: '100%', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Background Media</h4>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Upload Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploading} style={{ color: '#fff' }} />
                {formData.image && <p style={{ color: '#34c759', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ Image Ready</p>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Upload Video (Optional)</label>
                <input type="file" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} style={{ color: '#fff' }} />
                {formData.video && <p style={{ color: '#34c759', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ Video Ready</p>}
              </div>
            </div>
            {uploading && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: '1rem' }}>Uploading...</p>}
          </div>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title (e.g. SEO & Web Optimization)</label>
            <input 
              required type="text" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Sub Name / Category (e.g. Digital Marketing)</label>
            <input 
              required type="text" 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Slug (optional, auto-generated if blank)</label>
            <input 
              type="text" 
              value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div style={{ width: '100%', marginTop: '1rem' }}>
            <button type="submit" disabled={uploading} style={{ background: 'var(--accent)', color: '#000', padding: '0.8rem 2rem', borderRadius: '4px', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {isEditing ? 'Save Changes' : 'Save Category'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent)' }}>
                <th style={{ padding: '1rem', width: '40px' }}></th>
                <th style={{ padding: '1rem' }}>Media</th>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Sub Name</th>
                <th style={{ padding: '1rem' }}>Slug</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {categories.map(cat => (
                    <SortableRow key={cat.id} id={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        {cat.video ? (
                          <video src={cat.video} muted autoPlay loop style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : cat.image ? (
                          <img src={cat.image} alt={cat.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                           <div style={{ width: '60px', height: '40px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>-</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{cat.title}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{cat.category || '-'}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{cat.slug}</td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          onClick={() => toggleVisibility(cat)}
                          title={cat.is_visible ? "Hide Category" : "Show Category"}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cat.is_visible ? '#34c759' : '#ff3b30', display: 'flex', alignItems: 'center', padding: '0.5rem' }}
                        >
                          {cat.is_visible ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          )}
                        </button>
                        <button 
                          onClick={() => handleEdit(cat)}
                          style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
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

export default CategoriesManager;
