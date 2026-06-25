import React, { useState, useEffect, useRef } from 'react';
import { createTicketApi, fetchUserTicketsApi, fetchUserTicketDetailsApi, addUserTicketMessageApi } from '../../../services/auth';

const ISSUES_BY_CATEGORY = {
  'Account Issues': [
    'Login Problem',
    'Forgot Password',
    'Account Locked',
    'Two-Factor Authentication (2FA)',
    'Change Email/Mobile Number'
  ],
  'KYC Verification': [
    'KYC Pending',
    'KYC Rejected',
    'Document Update',
    'Identity Verification Issue',
    'Address Verification Issue'
  ],
  'Deposit Issues': [
    'Crypto Deposit Not Received',
    'Fiat Deposit Pending',
    'Wrong Deposit Amount',
    'Deposit Confirmation Delay'
  ],
  'Withdrawal Issues': [
    'Withdrawal Pending',
    'Withdrawal Failed',
    'Withdrawal Cancelled',
    'Incorrect Wallet Address',
    'Bank Withdrawal Issue'
  ],
  'Referral & Rewards': [
    'Referral Bonus Missing',
    'Commission Calculation Issue',
    'Invite Link Problem',
    'Reward Not Credited'
  ]
};

function UserSupport() {
  const [ticketList, setTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Account Issues');
  const [selectedIssue, setSelectedIssue] = useState('Login Problem');
  const [message, setMessage] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Fetch all user tickets on mount
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserTicketsApi();
      setTicketList(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Setup WebSocket connection for active ticket
  useEffect(() => {
    if (!selectedTicket) return;

    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:5000/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected to ticket chat room:', selectedTicket._id);
      ws.send(JSON.stringify({
        type: 'SUBSCRIBE_TICKET',
        ticketId: selectedTicket._id
      }));
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'TICKET_MESSAGE' && parsed.data.ticketId === selectedTicket._id) {
          const newMsg = parsed.data.message;
          const newStatus = parsed.data.status;
          setSelectedTicket(prev => {
            if (!prev) return null;
            const statusToSet = newStatus || prev.status;
            if (newMsg._id && prev.messages.some(m => m._id === newMsg._id)) {
              return {
                ...prev,
                status: statusToSet
              };
            }
            return {
              ...prev,
              status: statusToSet,
              messages: [...prev.messages, newMsg]
            };
          });
          
          // Also update the status in the main ticket list
          setTicketList(prevList => 
            prevList.map(t => t._id === selectedTicket._id ? { 
              ...t, 
              status: newStatus || (newMsg.senderRole === 'admin' ? 'Answered' : 'Open'),
              lastMessageAt: newMsg.createdAt
            } : t)
          );
        }
      } catch (err) {
        console.error('[WS] Error processing ticket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Ticket chat room WebSocket connection closed');
    };

    return () => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'UNSUBSCRIBE_TICKET' }));
        ws.close();
      }
    };
  }, [selectedTicket?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const finalSubject = `${selectedCategory} - ${selectedIssue}`;

    try {
      setIsSending(true);
      const newTicket = await createTicketApi(finalSubject, message);
      setTicketList(prev => [newTicket, ...prev]);
      setMessage('');
      setSelectedTicket(newTicket);
    } catch (err) {
      alert(err.message || 'Failed to create support ticket');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTicket) return;

    const textToSend = chatInput;
    setChatInput('');

    try {
      // API call to post message (which also triggers WS broadcast)
      await addUserTicketMessageApi(selectedTicket._id, textToSend);
    } catch (err) {
      alert(err.message || 'Failed to send message');
    }
  };

  const handleSelectTicket = async (ticket) => {
    try {
      const details = await fetchUserTicketDetailsApi(ticket._id);
      setSelectedTicket(details);
    } catch (err) {
      alert(err.message || 'Failed to fetch ticket details');
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', color: '#fff', maxWidth: '100%', overflowX: 'hidden' }}>
      <style>{`
        @media (max-width: 768px) {
          .support-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .support-grid > .glass-panel {
            padding: 16px !important;
          }
          .support-chat-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            gap: 16px !important;
          }
          .support-chat-metadata {
            order: 2;
            padding: 16px !important;
          }
          .support-chat-console {
            order: 1;
            height: 500px !important;
          }
          .step-input, select, textarea, input, button {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Help &amp; Support Desk
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Submit tickets and chat with our compliance managers in real-time.
          </p>
        </div>
        
        {selectedTicket && (
          <button 
            onClick={() => setSelectedTicket(null)}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ← Back to Tickets
          </button>
        )}
      </div>

      {selectedTicket ? (
        /* ================= ACTIVE CHATROOM VIEW ================= */
        <div className="support-chat-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: '600px' }}>
          
          {/* Chat room metadata sidebar */}
          <div className="glass-panel support-chat-metadata" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.4, letterSpacing: '1px' }}>Ticket Subject</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '4px 0 0 0' }}>{selectedTicket.subject}</h4>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.4, letterSpacing: '1px' }}>Ticket Status</span>
              <div style={{ marginTop: '6px' }}>
                <span className={`badge ${
                  selectedTicket.status === 'Open' ? 'badge-warning' :
                  selectedTicket.status === 'Answered' ? 'badge-success' : 'badge-danger'
                }`} style={{ textTransform: 'uppercase', padding: '4px 10px', fontSize: '0.7rem' }}>
                  {selectedTicket.status}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.4, letterSpacing: '1px' }}>Ticket ID</span>
              <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '4px' }}>
                {selectedTicket._id}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.4, letterSpacing: '1px' }}>Created On</span>
              <div style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                {formatDate(selectedTicket.createdAt)}
              </div>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                💡 WebSocket connection is active. All messages from administrators will appear instantly.
              </p>
            </div>
          </div>

          {/* Direct Live Chat Room */}
          <div className="glass-panel support-chat-console" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
            {/* Chat header bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.01)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedTicket.status === 'Closed' ? '#ef4444' : '#10b981', boxShadow: selectedTicket.status === 'Closed' ? 'none' : '0 0 8px #10b981' }}></div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Direct Support Chat</span>
            </div>

            {/* Chat messages viewport */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedTicket.messages?.map((msg, index) => {
                const isUser = msg.senderRole === 'user';
                const isSystem = msg.senderRole === 'system';

                if (isSystem) {
                  return (
                    <div key={msg._id || index} style={{ alignSelf: 'center', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', color: '#f87171' }}>
                      {msg.message}
                    </div>
                  );
                }

                return (
                  <div 
                    key={msg._id || index} 
                    style={{ 
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', opacity: 0.4, marginBottom: '4px', marginRight: isUser ? '4px' : 0, marginLeft: isUser ? 0 : '4px' }}>
                      {isUser ? 'You' : `${msg.senderName} (Support)`}
                    </span>
                    
                    <div style={{ 
                      background: isUser ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(255, 255, 255, 0.04)',
                      border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                      color: '#fff',
                      padding: '10px 16px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      boxShadow: isUser ? '0 4px 12px rgba(124, 58, 237, 0.15)' : 'none'
                    }}>
                      {msg.message}
                    </div>
                    
                    <span style={{ fontSize: '0.6rem', opacity: 0.3, marginTop: '4px', marginRight: isUser ? '4px' : 0, marginLeft: isUser ? 0 : '4px' }}>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat text composer input */}
            <form onSubmit={handleSendMessage} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '16px', display: 'flex', gap: '10px', background: 'rgba(255, 255, 255, 0.01)' }}>
              <input 
                type="text" 
                className="step-input" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={selectedTicket.status === 'Closed' ? 'This ticket is closed and cannot receive new messages.' : 'Type message here...'}
                style={{ margin: 0, padding: '12px', opacity: selectedTicket.status === 'Closed' ? 0.5 : 1, cursor: selectedTicket.status === 'Closed' ? 'not-allowed' : 'text' }}
                disabled={selectedTicket.status === 'Closed'}
                required
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '0 24px', flexShrink: 0, opacity: selectedTicket.status === 'Closed' ? 0.5 : 1, cursor: selectedTicket.status === 'Closed' ? 'not-allowed' : 'pointer' }}
                disabled={selectedTicket.status === 'Closed'}
              >
                Send
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* ================= TICKETS DIRECTORY & CREATOR VIEW ================= */
        <div className="support-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          
          {/* Create new ticket */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px' }}>Submit a Support Ticket</h3>
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Select Issue Category</label>
                <select 
                  className="step-input" 
                  value={selectedCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setSelectedCategory(cat);
                    setSelectedIssue(ISSUES_BY_CATEGORY[cat][0]);
                  }}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '12px', borderRadius: '8px', width: '100%', maxWidth: '100%', outline: 'none' }}
                >
                  {Object.keys(ISSUES_BY_CATEGORY).map(cat => (
                    <option key={cat} value={cat} style={{ background: '#12131a', color: '#fff' }}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Select Specific Issue</label>
                <select 
                  className="step-input" 
                  value={selectedIssue}
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '12px', borderRadius: '8px', width: '100%', maxWidth: '100%', outline: 'none' }}
                >
                  {ISSUES_BY_CATEGORY[selectedCategory].map(issue => (
                    <option key={issue} value={issue} style={{ background: '#12131a', color: '#fff' }}>{issue}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Detailed Message</label>
                <textarea 
                  className="step-input" 
                  rows={5}
                  placeholder="Provide full details. Add UTR or transaction numbers if relevant."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '12px 24px', alignSelf: 'flex-start' }}
                disabled={isSending}
              >
                {isSending ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>

          {/* Tickets list */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', maxHeight: '550px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px' }}>Your Tickets</h3>
            
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>Loading ticket history...</div>
            ) : error ? (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>
            ) : ticketList.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4, padding: '40px 0', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✉️</span>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>You don't have any support tickets yet. Submit your issue on the left.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                {ticketList.map(t => (
                  <div 
                    key={t._id} 
                    onClick={() => handleSelectTicket(t)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '12px 16px', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    className="support-ticket-item"
                  >
                    <div style={{ minWidth: 0, flex: 1, marginRight: '12px' }}>
                      <strong style={{ fontSize: '0.85rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.subject}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        ID: {t._id.substring(t._id.length - 8).toUpperCase()} • {formatDate(t.lastMessageAt)}
                      </span>
                    </div>
                    <span className={`badge ${
                      t.status === 'Open' ? 'badge-warning' :
                      t.status === 'Answered' ? 'badge-success' : 'badge-danger'
                    }`} style={{ fontSize: '0.65rem', padding: '3px 8px', textTransform: 'uppercase' }}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

export default UserSupport;
