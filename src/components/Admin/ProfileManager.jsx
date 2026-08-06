import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const ProfileManager = () => {
  const [profile, setProfile] = useState({
    photo_url: '',
    bio: '',
    years_experience: 0,
    projects_completed: 0,
    loyal_clients: 0,
    experience: [],
    skills: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profile_info').select('*').eq('id', 1).single();
    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

    setProfile(prev => ({ ...prev, photo_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profile_info')
      .update(profile)
      .eq('id', 1);
    
    if (error) {
      alert('Error saving profile: ' + error.message);
    } else {
      alert('Profile saved successfully!');
    }
    setSaving(false);
  };

  // Experience Handlers
  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', tasks: [''], is_visible: true }]
    }));
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...profile.experience];
    newExp[index][field] = value;
    setProfile({ ...profile, experience: newExp });
  };

  const removeExperience = (index) => {
    const newExp = profile.experience.filter((_, i) => i !== index);
    setProfile({ ...profile, experience: newExp });
  };

  const updateTask = (expIndex, taskIndex, value) => {
    const newExp = [...profile.experience];
    newExp[expIndex].tasks[taskIndex] = value;
    setProfile({ ...profile, experience: newExp });
  };

  const addTask = (expIndex) => {
    const newExp = [...profile.experience];
    newExp[expIndex].tasks.push('');
    setProfile({ ...profile, experience: newExp });
  };

  const removeTask = (expIndex, taskIndex) => {
    const newExp = [...profile.experience];
    newExp[expIndex].tasks = newExp[expIndex].tasks.filter((_, i) => i !== taskIndex);
    setProfile({ ...profile, experience: newExp });
  };

  // Skills Handlers
  const addSkill = () => {
    setProfile(prev => ({ ...prev, skills: [...prev.skills, { name: '', is_visible: true }] }));
  };

  const updateSkill = (index, value) => {
    const newSkills = [...profile.skills];
    // Convert string to object if it's old data
    if (typeof newSkills[index] === 'string') {
      newSkills[index] = { name: value, is_visible: true };
    } else {
      newSkills[index].name = value;
    }
    setProfile({ ...profile, skills: newSkills });
  };

  const toggleSkillVisibility = (index) => {
    const newSkills = [...profile.skills];
    if (typeof newSkills[index] === 'string') {
      newSkills[index] = { name: newSkills[index], is_visible: false };
    } else {
      newSkills[index].is_visible = !newSkills[index].is_visible;
    }
    setProfile({ ...profile, skills: newSkills });
  };

  const toggleExpVisibility = (index) => {
    const newExp = [...profile.experience];
    newExp[index].is_visible = newExp[index].is_visible === undefined ? false : !newExp[index].is_visible;
    setProfile({ ...profile, experience: newExp });
  };

  const removeSkill = (index) => {
    const newSkills = profile.skills.filter((_, i) => i !== index);
    setProfile({ ...profile, skills: newSkills });
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Profile & Home Page</h2>
        <button 
          onClick={handleSave}
          disabled={saving || uploading}
          style={{ background: 'var(--accent)', color: '#000', padding: '0.8rem 2rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>Basic Info & Photo</h3>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Profile Photo</label>
            {profile.photo_url && (
              <img src={profile.photo_url} alt="Profile" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem', background: '#fff' }} />
            )}
            <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} style={{ color: '#fff' }} />
            {uploading && <p style={{ color: 'var(--accent)' }}>Uploading...</p>}
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bio / Description</label>
            <textarea 
              value={profile.bio} 
              onChange={e => setProfile({...profile, bio: e.target.value})}
              rows={5}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Years Experience</label>
            <input 
              type="number" 
              value={profile.years_experience} 
              onChange={e => setProfile({...profile, years_experience: parseInt(e.target.value) || 0})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Projects Completed</label>
            <input 
              type="number" 
              value={profile.projects_completed} 
              onChange={e => setProfile({...profile, projects_completed: parseInt(e.target.value) || 0})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Loyal Clients</label>
            <input 
              type="number" 
              value={profile.loyal_clients} 
              onChange={e => setProfile({...profile, loyal_clients: parseInt(e.target.value) || 0})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--accent)' }}>Professional Experience</h3>
          <button onClick={addExperience} style={{ background: 'rgba(52, 199, 89, 0.2)', color: '#34c759', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>+ Add Job</button>
        </div>
        
        {profile.experience.map((exp, expIndex) => (
          <div key={expIndex} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => toggleExpVisibility(expIndex)}
                title={(exp.is_visible ?? true) ? "Hide Experience" : "Show Experience"}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: (exp.is_visible ?? true) ? '#34c759' : '#ff3b30', display: 'flex', alignItems: 'center', padding: '0.5rem' }}
              >
                {(exp.is_visible ?? true) ? (
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
              <button onClick={() => removeExperience(expIndex)} style={{ background: 'transparent', color: '#ff3b30', border: 'none', cursor: 'pointer' }}>Remove Job</button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Job Title</label>
                <input 
                  type="text" 
                  value={exp.title} 
                  onChange={e => updateExperience(expIndex, 'title', e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Company & Period (e.g. Google, Doha | Jan 2026 - Present)</label>
                <input 
                  type="text" 
                  value={exp.company} 
                  onChange={e => updateExperience(expIndex, 'company', e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tasks / Responsibilities</label>
              {exp.tasks.map((task, taskIndex) => (
                <div key={taskIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={task} 
                    onChange={e => updateTask(expIndex, taskIndex, e.target.value)}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                  <button onClick={() => removeTask(expIndex, taskIndex)} style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: 'none', padding: '0 1rem', borderRadius: '4px', cursor: 'pointer' }}>X</button>
                </div>
              ))}
              <button onClick={() => addTask(expIndex)} style={{ background: 'transparent', color: 'var(--accent)', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>+ Add Task</button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--accent)' }}>Key Skills</h3>
          <button onClick={addSkill} style={{ background: 'rgba(52, 199, 89, 0.2)', color: '#34c759', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>+ Add Skill</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {profile.skills.map((skill, index) => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            const isVisible = typeof skill === 'string' ? true : skill.is_visible;
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={() => toggleSkillVisibility(index)}
                  title={isVisible ? "Hide Skill" : "Show Skill"}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isVisible ? '#34c759' : '#ff3b30', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                >
                  {isVisible ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
                <input 
                  type="text" 
                  value={skillName} 
                  onChange={e => updateSkill(index, e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', width: '120px' }}
                />
                <button onClick={() => removeSkill(index)} style={{ background: 'transparent', color: '#ff3b30', border: 'none', cursor: 'pointer' }}>X</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;
