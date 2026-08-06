import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const HomeImagesManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('home_images').select('*').order('created_at', { ascending: false });
    if (!error) setImages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const toggleVisibility = async (image) => {
    const { error } = await supabase
      .from('home_images')
      .update({ is_visible: !image.is_visible })
      .eq('id', image.id);
    
    if (!error) fetchImages();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    const { error } = await supabase.from('home_images').delete().eq('id', id);
    if (!error) fetchImages();
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

    const { error: insertError } = await supabase
      .from('home_images')
      .insert([{ image_url: data.publicUrl, is_visible: true }]);
    
    if (insertError) {
      alert('Error saving to database: ' + insertError.message);
    } else {
      fetchImages();
    }
    
    setUploading(false);
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

      {loading ? (
        <p>Loading images...</p>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent)' }}>
                <th style={{ padding: '1rem' }}>Image Preview</th>
                <th style={{ padding: '1rem' }}>Visibility</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map(image => (
                <tr key={image.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                      onClick={() => handleDelete(image.id)}
                      style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {images.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No images uploaded yet. Upload some images to display them on your home page!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HomeImagesManager;
