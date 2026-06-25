import React, { useState, useEffect, useRef } from 'react';
import { fetchAdminTicketsApi, fetchAdminTicketDetailsApi, addAdminTicketMessageApi, closeAdminTicketApi } from '../../../services/admin';

function AdminTickets() {
  const [ticketList, setTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Fetch all tickets on mount
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAdminTicketsApi();
      setTicketList(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch support tickets from server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time updates via WebSocket (for ticket list & current active ticket messages)
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Admin Help Desk subscribed to ticket updates');
      
      // Subscribe to all ticket list notifications
      ws.send(JSON.stringify({ type: 'SUBSCRIBE_ADMIN_TICKETS' }));

      // If a ticket is currently open, subscribe to its individual chat room
      if (selectedTicket) {
        ws.send(JSON.stringify({
          type: 'SUBSCRIBE_TICKET',
          ticketId: selectedTicket._id
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        // Handle message update in active chat room
        if (parsed.type === 'TICKET_MESSAGE' && selectedTicket && parsed.data.ticketId === selectedTicket._id) {
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
        }

        // Handle ticket list updates (new tickets or status changes)
        if (parsed.type === 'ADMIN_TICKET_UPDATE') {
          const { type, ticket } = parsed.data;
          
          setTicketList(prevList => {
            const index = prevList.findIndex(t => t._id === ticket._id);
            if (index !== -1) {
              // Update existing ticket in the list
              const updated = [...prevList];
              updated[index] = { ...updated[index], ...ticket };
              // Sort list by lastMessageAt descending
              return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
            } else {
              // Prepend new ticket to the list
              return [ticket, ...prevList];
            }
          });

          // If this ticket is the selected ticket, update its header/status
          if (selectedTicket && ticket._id === selectedTicket._id) {
            setSelectedTicket(prev => prev ? { ...prev, status: ticket.status } : null);
          }
        }
      } catch (err) {
        console.error('[WS] Error processing admin socket event:', err);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Admin Help Desk WebSocket closed');
    };

    return () => {
      if (ws.readyState === ws.OPEN) {
        ws.close();
      }
    };
  }, [selectedTicket?._id]);

  // Scroll to bottom of chat when message list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const handleSelectTicket = async (ticket) => {
    try {
      const details = await fetchAdminTicketDetailsApi(ticket._id);
      setSelectedTicket(details);
    } catch (err) {
      alert(err.message || 'Failed to fetch ticket details');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTicket) return;

    const textToSend = chatInput;
    setChatInput('');

    try {
      await addAdminTicketMessageApi(selectedTicket._id, textToSend);
    } catch (err) {
      alert(err.message || 'Failed to send reply');
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    if (!window.confirm('Are you sure you want to mark this ticket as Closed?')) return;

    try {
      const updated = await closeAdminTicketApi(selectedTicket._id);
      setSelectedTicket(updated);
    } catch (err) {
      alert(err.message || 'Failed to close ticket');
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

  const filteredTickets = ticketList.filter(t => {
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', color: '#fff' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Help Desk &amp; Tickets Manager
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Manage user complaints and chat directly in real-time.
          </p>
        </div>
        
        {selectedTicket && (
          <button 
            onClick={() => setSelectedTicket(null)}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            ← Back to Ticket Queue
          </button>
        )}
      </div>

      {selectedTicket ? (
        /* ================= ACTIVE HELPDESK CHAT VIEW ================= */
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', height: '600px' }}>
          
          {/* Left panel metadata info */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.4, letterSpacing: '1px' }}>Customer Profile</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '4px 0 0 0' }}>{selectedTicket.user?.name || 'Unknown User'}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{selectedTicket.user?.email}</p>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '4px' }}>
                CX ID: {selectedTicket.user?.cxId?.toUpperCase() || 'N/A'}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.05)', margin: 0 }} />

            <div>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.4, letterSpacing: '1px' }}>Ticket Subject</span>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginTop: '4px' }}>{selectedTicket.subject}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.4, letterSpacing: '1px' }}>Status</span>
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
              <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', opacity: 0.6 }}>{selectedTicket._id}</div>
            </div>

            {selectedTicket.status !== 'Closed' ? (
              <button 
                onClick={handleCloseTicket}
                className="btn btn-primary"
                style={{ marginTop: 'auto', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px' }}
              >
                🔒 Close Ticket
              </button>
            ) : (
              <div style={{ marginTop: 'auto', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket Resolved &amp; Closed</span>
              </div>
            )}
          </div>

          {/* Right panel live messaging desk */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
            {/* Live indicator bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Active Live Session</span>
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>Real-time updates active</span>
            </div>

            {/* Message window */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedTicket.messages?.map((msg, index) => {
                const isAdmin = msg.senderRole === 'admin';
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
                      alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAdmin ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', opacity: 0.4, marginBottom: '4px', marginRight: isAdmin ? '4px' : 0, marginLeft: isAdmin ? 0 : '4px' }}>
                      {isAdmin ? 'You (Admin)' : msg.senderName}
                    </span>
                    
                    <div style={{ 
                      background: isAdmin ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(255, 255, 255, 0.04)',
                      border: isAdmin ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                      color: '#fff',
                      padding: '10px 16px',
                      borderRadius: isAdmin ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      boxShadow: isAdmin ? '0 4px 12px rgba(124, 58, 237, 0.15)' : 'none'
                    }}>
                      {msg.message}
                    </div>
                    
                    <span style={{ fontSize: '0.6rem', opacity: 0.3, marginTop: '4px', marginRight: isAdmin ? '4px' : 0, marginLeft: isAdmin ? 0 : '4px' }}>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSendMessage} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '16px', display: 'flex', gap: '10px', background: 'rgba(255, 255, 255, 0.01)' }}>
              <input 
                type="text" 
                className="step-input" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={selectedTicket.status === 'Closed' ? 'This ticket is closed and cannot receive new messages.' : 'Type response message...'}
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
                Send Reply
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* ================= ALL TICKETS LIST DIRECTORY ================= */
        <div className="glass-panel" style={{ padding: '24px' }}>
          
          {/* Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Support Ticket Queue</h3>
            
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {['All', 'Open', 'Answered', 'Closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: statusFilter === status ? 'var(--color-primary)' : 'transparent',
                    color: statusFilter === status ? '#fff' : 'rgba(255,255,255,0.6)',
                    transition: 'all 0.2s'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets Table */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>Loading customer ticket history...</div>
          ) : error ? (
            <div style={{ color: 'var(--danger)', textAlign: 'center', padding: '20px' }}>{error}</div>
          ) : filteredTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.4 }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>✉️</span>
              No tickets found matching the status "{statusFilter}".
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="rates-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer Name</th>
                    <th>CX ID</th>
                    <th>Subject</th>
                    <th>Last Active</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(t => (
                    <tr key={t._id} style={{ cursor: 'pointer' }} onClick={() => handleSelectTicket(t)}>
                      <td style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--color-primary)' }}>
                        #{t._id.substring(t._id.length - 8).toUpperCase()}
                      </td>
                      <td>{t.user?.name || 'Unknown User'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', opacity: 0.8 }}>
                        {t.user?.cxId?.toUpperCase() || 'N/A'}
                      </td>
                      <td style={{ fontWeight: '600' }}>{t.subject}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {formatDate(t.lastMessageAt)}
                      </td>
                      <td>
                        <span className={`badge ${
                          t.status === 'Open' ? 'badge-warning' :
                          t.status === 'Answered' ? 'badge-success' : 'badge-danger'
                        }`} style={{ fontSize: '0.65rem', padding: '3px 8px', textTransform: 'uppercase' }}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Open Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default AdminTickets;
