import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableRow } from './SortableRow';

const HomeImagesManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState({ id: '', link_url: '' });

  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    const [imagesRes, catRes, clientRes, projRes] = await Promise.all([
      supabase.from('home_images').select('*').order('order_index', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('project_categories').select('*').order('title'),
      supabase.from('clients').select('*').order('name'),
      supabase.from('projects').select('id, title, category_id').order('title')
    ]);

    if (!imagesRes.error) setImages(imagesRes.data);
    if (!catRes.error) setCategories(catRes.data);
    if (!clientRes.error) setClients(clientRes.data);
    if (!projRes.error) setProjects(projRes.data);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleVisibility = async (image) => {
    const { error } = await supabase
      .from('home_images')
      .update({ is_visible: !image.is_visible })
      .eq('id', image.id);
    
    if (!error) fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    const { error } = await supabase.from('home_images').delete().eq('id', id);
    if (!error) fetchData();
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    let uploadedCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        errorCount++;
        continue;
      }

      const { data } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('home_images')
        .insert([{ image_url: data.publicUrl, is_visible: true }]);
      
      if (insertError) {
        console.error('Error saving to database:', insertError);
        errorCount++;
      } else {
        uploadedCount++;
      }
    }
    
    if (errorCount > 0) {
      alert(`Finished. Successfully uploaded ${uploadedCount} images. Failed to upload ${errorCount} images.`);
    }
    
    fetchData();
    setUploading(false);
    
    // Reset input
    e.target.value = null;
  };

  const handleEditClick = (img) => {
    setCurrentEditItem({ id: img.id, link_url: img.link_url || '' });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase
      .from('home_images')
      .update({ link_url: currentEditItem.link_url })
      .eq('id', currentEditItem.id);
    
    if (error) {
      alert('Error updating link: ' + error.message);
    } else {
      fetchData();
      setIsEditing(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Update database in background
        const updates = newArray.map((item, index) => ({
          id: item.id,
          image_url: item.image_url, // Required for upsert or update if we use a loop
          order_index: index,
        }));
        
        // Fire and forget updating the order
        updates.forEach(async (update) => {
          await supabase.from('home_images').update({ order_index: update.order_index }).eq('id', update.id);
        });

        return newArray;
      });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Home Images</h2>
        <div>
          <label 
            style={{ 
              background: 'var(--accent)', 
              color: '#000', 
              padding: '0.8rem 2rem', 
              borderRadius: '4px', 
              cursor: uploading ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            {uploading ? 'Uploading...' : '+ Upload Image'}
            <input 
              type="file" 
              accept="image/*"
              multiple 
              onChange={handleFileUpload} 
              disabled={uploading} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Upload images here to display them in a gallery on your home page. Use the eye icon to easily hide/show them.
      </p>

      {isEditing && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Edit Image Link</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Choose where this image should take visitors when they click on it from the Home Page. Leave blank for no link.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Destination / Link</label>
              <select 
                value={currentEditItem.link_url} 
                onChange={e => setCurrentEditItem({ ...currentEditItem, link_url: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <option value="">None (Just open image)</option>
                <optgroup label="Categories">
                  {categories.map(c => <option key={c.id} value={`/projects/${c.slug}`}>{c.title}</option>)}
                </optgroup>
                <optgroup label="Clients">
                  {clients.map(c => <option key={c.id} value={`/clients/${c.id}`}>{c.name}</option>)}
                </optgroup>
                <optgroup label="Projects (Note: Make sure they have a valid category first)">
                  {projects.map(p => {
                    const cat = categories.find(c => c.id === p.category_id);
                    if (!cat) return null;
                    return <option key={p.id} value={`/projects/${cat.slug}?project=${p.id}`}>{p.title}</option>;
                  })}
                </optgroup>
              </select>
            </div>
            <button onClick={handleSaveEdit} style={{ background: 'var(--accent)', color: '#000', padding: '0.8rem 2rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Save Link
            </button>
            <button onClick={() => setIsEditing(false)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem 2rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading images...</p>
      ) : (
        <div className="table-responsive">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent)' }}>
                  <th style={{ padding: '1rem', width: '50px' }}></th>
                  <th style={{ padding: '1rem' }}>Image Preview</th>
                  <th style={{ padding: '1rem' }}>Visibility</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <SortableContext items={images.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {images.map(image => (
                    <SortableRow key={image.id} id={image.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <img src={image.image_url} alt="Home Gallery" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: image.is_visible ? '#34c759' : '#ff3b30', fontSize: '0.9rem', fontWeight: 'bold' }}>
                          {image.is_visible ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', height: '100px' }}>
                        <button 
                          onClick={() => toggleVisibility(image)}
                          title={image.is_visible ? "Hide Image" : "Show Image"}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: image.is_visible ? '#34c759' : '#ff3b30', display: 'flex', alignItems: 'center', padding: '0.5rem' }}
                        >
                          {image.is_visible ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          )}
                        </button>
                        <button 
                          onClick={() => handleEditClick(image)}
                          style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(image.id)}
                          style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </SortableRow>
                  ))}
                  {images.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No images uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default HomeImagesManager;
