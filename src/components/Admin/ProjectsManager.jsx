import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableRow } from './SortableRow';

const ProjectsManager = () => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: '', 
    category_id: '', 
    title: '', 
    client_id: '',
    business_id: '',
    image: '', 
    video: '', 
    document: '',
    website_link: ''
  });

  const fetchProjects = async () => {
    setLoading(true);
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .select('*, project_categories(title), clients(name), businesses(name)')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });
      
    const { data: catData } = await supabase.from('project_categories').select('*');
    const { data: clientData } = await supabase.from('clients').select('*');
    const { data: businessData } = await supabase.from('businesses').select('*');
    
    if (!projError) setProjects(projData);
    if (catData) setCategories(catData);
    if (clientData) setClients(clientData);
    if (businessData) setBusinesses(businessData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggleVisibility = async (project) => {
    const { error } = await supabase
      .from('projects')
      .update({ is_visible: !project.is_visible })
      .eq('id', project.id);
    
    if (!error) fetchProjects();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) fetchProjects();
  };

  const handleEdit = (project) => {
    setFormData({
      id: project.id,
      category_id: project.category_id || '',
      title: project.title || '',
      client_id: project.client_id || '',
      business_id: project.business_id || '',
      image: project.image || '',
      video: project.video || '',
      document: project.document || '',
      website_link: project.website_link || ''
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
    } else if (type === 'document') {
      setFormData(prev => ({ ...prev, document: data.publicUrl }));
    } else {
      setFormData(prev => ({ ...prev, image: data.publicUrl }));
    }
    
    setUploading(false);
  };

  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const defaultCategoryId = categories.length > 0 ? categories[0].id : null;
    
    if (!defaultCategoryId) {
      alert('Please create at least one Category first before bulk uploading projects.');
      return;
    }

    setUploading(true);
    let uploadedCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('portfolio-media').upload(fileName, file);
      if (uploadError) {
        errorCount++;
        continue;
      }

      const { data } = supabase.storage.from('portfolio-media').getPublicUrl(fileName);
      const title = file.name.replace(`.${fileExt}`, '');

      const payload = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        title: title,
        category_id: defaultCategoryId,
        image: data.publicUrl
      };

      const { error: insertError } = await supabase.from('projects').insert([payload]);
      if (insertError) {
        errorCount++;
      } else {
        uploadedCount++;
      }
    }
    
    if (errorCount > 0 || uploadedCount > 0) {
      alert(`Bulk Upload Finished! Added ${uploadedCount} projects. Failed: ${errorCount}`);
    }
    fetchProjects();
    setUploading(false);
    e.target.value = null;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    const projectId = isEditing ? formData.id : `proj_${Date.now()}`;
    
    const payload = {
      id: projectId,
      category_id: parseInt(formData.category_id),
      title: formData.title,
      client_id: formData.client_id ? parseInt(formData.client_id) : null,
      business_id: formData.business_id ? parseInt(formData.business_id) : null,
      image: formData.image || null,
      video: formData.video || null,
      document: formData.document || null,
      website_link: formData.website_link || null,
    };

    let error;
    if (isEditing) {
      const res = await supabase.from('projects').update(payload).eq('id', projectId);
      error = res.error;
    } else {
      const res = await supabase.from('projects').insert([payload]);
      error = res.error;
    }

    if (!error) {
      setIsAdding(false);
      setIsEditing(false);
      setFormData({ id: '', category_id: '', title: '', client_id: '', business_id: '', image: '', video: '', document: '', website_link: '' });
      fetchProjects();
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
      const oldIndex = projects.findIndex((item) => item.id === active.id);
      const newIndex = projects.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(projects, oldIndex, newIndex);
      setProjects(newOrder);

      // Update Supabase
      const updates = newOrder.map((proj, index) => ({
        id: proj.id,
        order_index: index,
        title: proj.title, // required fields might be needed depending on RLS or strict mode, but usually just id and the field to update is enough. But upsert needs the whole row. Let's just do individual updates or an RPC. Individual updates is fine for small lists.
      }));
      
      for (const update of updates) {
        await supabase.from('projects').update({ order_index: update.order_index }).eq('id', update.id);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Projects</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label style={{ background: 'var(--accent)', color: '#000', padding: '0.5rem 1rem', borderRadius: '4px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            {uploading ? 'Uploading...' : 'Bulk Upload'}
            <input type="file" accept="image/*" multiple onChange={handleBulkUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
          <button 
            onClick={() => {
              if (isAdding) {
                setIsAdding(false);
                setIsEditing(false);
                setFormData({ id: '', category_id: '', title: '', client_id: '', image: '', video: '', document: '' });
              } else {
                setIsAdding(true);
              }
            }}
            style={{ background: 'var(--accent)', color: '#000', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isAdding ? 'Cancel' : '+ Add Project'}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
          <div style={{ width: '100%', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Media Uploader</h4>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Upload Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploading} style={{ color: '#fff' }} />
                {formData.image && <p style={{ color: '#34c759', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ Image Ready</p>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Upload Video (MP4)</label>
                <input type="file" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} style={{ color: '#fff' }} />
                {formData.video && <p style={{ color: '#34c759', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ Video Ready</p>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Upload Document (PDF/Doc)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'document')} disabled={uploading} style={{ color: '#fff' }} />
                {formData.document && <p style={{ color: '#34c759', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ Document Ready</p>}
              </div>
            </div>
            {uploading && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: '1rem' }}>Uploading file to secure storage... please wait.</p>}
          </div>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />

          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
            <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
              <option value="">Select Category...</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Client (Optional)</label>
            <select value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
              <option value="">No Client</option>
              {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Business (Optional)</label>
            <select value={formData.business_id} onChange={e => setFormData({...formData, business_id: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
              <option value="">No Business</option>
              {businesses.map(business => <option key={business.id} value={business.id}>{business.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Live Website Link (Optional)</label>
            <input type="url" placeholder="https://example.com" value={formData.website_link} onChange={e => setFormData({...formData, website_link: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
          </div>
          
          <div style={{ width: '100%', marginTop: '1rem' }}>
            <button type="submit" disabled={uploading} style={{ background: 'var(--accent)', color: '#000', padding: '0.8rem 2rem', borderRadius: '4px', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {isEditing ? 'Save Changes' : 'Save Project'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent)' }}>
                <th style={{ padding: '1rem', width: '40px' }}></th>
                <th style={{ padding: '1rem' }}>Preview</th>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Client</th>
                <th style={{ padding: '1rem' }}>Business</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {projects.map(project => (
                    <SortableRow key={project.id} id={project.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        {project.video ? (
                          <video src={project.video} muted autoPlay loop style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : project.image ? (
                          <img src={project.image} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : project.document ? (
                          <div style={{ width: '60px', height: '40px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>Doc</div>
                        ) : null}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{project.title}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{project.project_categories?.title || 'Unknown'}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{project.clients?.name || '-'}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{project.businesses?.name || '-'}</td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          onClick={() => toggleVisibility(project)}
                          title={project.is_visible ? "Hide Project" : "Show Project"}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: project.is_visible ? '#34c759' : '#ff3b30', display: 'flex', alignItems: 'center', padding: '0.5rem' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {project.is_visible ? (
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
                          onClick={() => handleEdit(project)}
                          style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)}
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

export default ProjectsManager;
