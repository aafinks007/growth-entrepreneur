import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, ImagePlus } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi there! 👋 I am AI Aafin, your Growth Entrepreneur. How can I help you scale your business today? 🚀💡" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (window.location.pathname !== '/') return;

    let hideTimer;
    const showTimer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
        hideTimer = setTimeout(() => setShowTooltip(false), 10000);
      }
    }, 2000);

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isOpen]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({ file, dataUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = { role: 'user', content: input.trim(), image: selectedImage?.dataUrl };
    setMessages(prev => [...prev, userMessage]);
    
    const payloadImage = selectedImage?.dataUrl || null;
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content })), 
          message: userMessage.content,
          image: payloadImage
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => { setIsOpen(true); setShowTooltip(false); }}
            style={{
              position: 'fixed',
              bottom: '100px', // Just above WhatsApp (which is 2rem/32px + 60px height)
              right: '2rem',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open AI Assistant"
          >
            <MessageCircle size={30} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{
              position: 'fixed',
              bottom: '110px',
              right: '6.5rem',
              background: '#fff',
              color: '#111',
              padding: '10px 16px',
              borderRadius: '20px',
              borderBottomRightRadius: '4px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              zIndex: 998,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap'
            }}
            onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          >
            <motion.img 
              src="/aafin-avatar-waving.jpg" 
              alt="Aafin Waving" 
              animate={{ rotate: [0, 10, -10, 10, 0, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)', transformOrigin: 'bottom center' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '500' }}>AI Aafin</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Hi! How can I help you? 
                <motion.span
                  animate={{ rotate: [0, 20, -10, 20, 0, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                  style={{ display: 'inline-block', transformOrigin: 'bottom right' }}
                >
                  👋
                </motion.span>
              </span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}
            >
              <X size={16} color="#666" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '2rem',
              width: '350px',
              height: '500px',
              maxHeight: '80vh',
              backgroundColor: 'rgba(15, 15, 15, 0.85)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1000,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/aafin-avatar.jpg" alt="Aafin" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>AI Aafin</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.map((msg, index) => (
                <div key={index} style={{
                  display: 'flex', 
                  gap: '8px', 
                  alignItems: 'flex-end',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%'
                }}>
                  {msg.role === 'assistant' && (
                    <img src="/aafin-avatar.jpg" alt="AI" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginBottom: '2px' }} />
                  )}
                  <div 
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      fontSize: '0.95rem',
                      lineHeight: '1.4',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                      borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                    }}
                  >
                    {msg.image && (
                      <img 
                        src={msg.image} 
                        alt="uploaded" 
                        style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: msg.content ? '8px' : '0' }} 
                      />
                    )}
                    {msg.content && <div>{msg.content}</div>}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', alignSelf: 'flex-start' }}>
                  <img src="/aafin-avatar.jpg" alt="AI" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginBottom: '2px' }} />
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    padding: '0.75rem 1rem',
                    borderRadius: '16px',
                    borderBottomLeftRadius: '4px',
                    color: 'var(--text-secondary)'
                  }}>
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                    </motion.div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <AnimatePresence>
                {selectedImage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{ position: 'relative', width: 'fit-content' }}
                  >
                    <img src={selectedImage.dataUrl} alt="preview" style={{ height: '60px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      style={{
                        position: 'absolute', top: '-5px', right: '-5px',
                        background: 'var(--accent)', border: 'none', borderRadius: '50%',
                        width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', cursor: 'pointer'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  style={{ display: 'none' }} 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Attach Image"
                >
                  <ImagePlus size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '0.75rem 1rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  style={{
                    backgroundColor: (input.trim() || selectedImage) && !isLoading ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    color: '#fff',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Send size={18} style={{ marginLeft: '2px' }} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
