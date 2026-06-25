const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { sendTicketMessage, broadcastAdminTicketUpdate } = require('../websocket');
const { sendTelegramNotification } = require('../services/telegramService');

// @desc    Create a support ticket
// @route   POST /api/user/tickets
// @access  Private
exports.createUserTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const ticket = new Ticket({
      user: req.user._id,
      subject,
      status: 'Open',
      messages: [
        {
          sender: req.user._id,
          senderName: req.user.name,
          senderRole: 'user',
          message
        }
      ],
      lastMessageAt: Date.now()
    });

    const savedTicket = await ticket.save();
    
    // Populate user info for admin notifications
    const populated = await Ticket.findById(savedTicket._id).populate('user', 'name email cxId');

    // Send Telegram Notification
    sendTelegramNotification(`🎫 <b>New Support Ticket Raised</b>\n\n<b>User:</b> ${populated.user ? populated.user.name : 'Unknown'} (${populated.user ? populated.user.email : 'Unknown'})\n<b>CX ID:</b> <code>${populated.user ? populated.user.cxId : 'N/A'}</code>\n<b>Subject:</b> ${subject}\n<b>Message:</b> ${message}`);

    // Notify admins of new ticket
    broadcastAdminTicketUpdate({
      type: 'NEW_TICKET',
      ticket: populated
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's support tickets
// @route   GET /api/user/tickets
// @access  Private
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .sort({ lastMessageAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get details of a single ticket
// @route   GET /api/user/tickets/:id
// @access  Private
exports.getUserTicketDetails = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a message to a ticket (User)
// @route   POST /api/user/tickets/:id/messages
// @access  Private
exports.addUserMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.status === 'Closed') {
      return res.status(400).json({ message: 'This ticket is closed and cannot receive new messages.' });
    }

    const messageObj = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: 'user',
      message,
      createdAt: Date.now()
    };

    ticket.messages.push(messageObj);
    ticket.status = 'Open'; // Re-opens if answered/closed
    ticket.lastMessageAt = Date.now();

    const savedTicket = await ticket.save();
    const newlyCreatedMessage = savedTicket.messages[savedTicket.messages.length - 1];

    // Broadcast new message to the room
    sendTicketMessage(savedTicket._id, newlyCreatedMessage, 'Open');

    // Notify admins of ticket update
    const populated = await Ticket.findById(ticket._id).populate('user', 'name email cxId');

    // Send Telegram Notification
    sendTelegramNotification(`💬 <b>New User Reply on Support Ticket</b>\n\n<b>User:</b> ${populated.user ? populated.user.name : 'Unknown'} (${populated.user ? populated.user.email : 'Unknown'})\n<b>CX ID:</b> <code>${populated.user ? populated.user.cxId : 'N/A'}</code>\n<b>Subject:</b> ${ticket.subject}\n<b>Message:</b> ${message}`);

    broadcastAdminTicketUpdate({
      type: 'TICKET_UPDATED',
      ticket: populated
    });

    res.json(ticket);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= ADMIN CONTROLLERS =================

// @desc    Get all support tickets
// @route   GET /api/admin/tickets
// @access  Private/Admin
exports.adminGetAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('user', 'name email cxId')
      .sort({ lastMessageAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get details of a single ticket (Admin)
// @route   GET /api/admin/tickets/:id
// @access  Private/Admin
exports.adminGetTicketDetails = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('user', 'name email cxId');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket details (Admin):', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a message to a ticket (Admin)
// @route   POST /api/admin/tickets/:id/messages
// @access  Private/Admin
exports.adminAddMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.status === 'Closed') {
      return res.status(400).json({ message: 'This ticket is closed and cannot receive new messages.' });
    }

    const messageObj = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: 'admin',
      message,
      createdAt: Date.now()
    };

    ticket.messages.push(messageObj);
    ticket.status = 'Answered';
    ticket.lastMessageAt = Date.now();

    const savedTicket = await ticket.save();
    const newlyCreatedMessage = savedTicket.messages[savedTicket.messages.length - 1];

    // Broadcast new message to the room
    sendTicketMessage(savedTicket._id, newlyCreatedMessage, 'Answered');

    // Notify admins of ticket update (to refresh their list views)
    const populated = await Ticket.findById(ticket._id).populate('user', 'name email cxId');
    broadcastAdminTicketUpdate({
      type: 'TICKET_UPDATED',
      ticket: populated
    });

    res.json(ticket);
  } catch (error) {
    console.error('Error adding admin message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Close a support ticket
// @route   PUT /api/admin/tickets/:id/close
// @access  Private/Admin
exports.adminCloseTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = 'Closed';
    ticket.lastMessageAt = Date.now();

    await ticket.save();

    // Broadcast the status change to the room
    sendTicketMessage(ticket._id, {
      senderRole: 'system',
      message: 'This ticket has been marked as Closed by support.',
      createdAt: Date.now()
    }, 'Closed');

    // Notify admins
    const populated = await Ticket.findById(ticket._id).populate('user', 'name email cxId');
    broadcastAdminTicketUpdate({
      type: 'TICKET_UPDATED',
      ticket: populated
    });

    res.json(populated);
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
