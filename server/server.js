require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const autoSeed = require('./autoSeed');
const User = require('./models/User');
const logger = require('./logger');
const examRoutes = require('./routes/examRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

// Middleware
app.use(cors());
app.use(express.json());

// Custom Morgan format to log body and use winston stream
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', { stream: logger.stream }));

// Connect to MongoDB
connectDB().then(() => {
  autoSeed();
});

// Routes
app.use('/api/exams', examRoutes);
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/generate', require('./routes/generateRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// Auth Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { structuredId, passcode } = req.body;

    if (!structuredId || !passcode) {
      return res.status(400).json({ message: 'structuredId and passcode are required' });
    }

    // Find the user
    const user = await User.findOne({ structuredId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify passcode
    const isMatch = await bcrypt.compare(passcode, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Parse identity fields from structuredId
    // e.g., '7321CSE001'
    const tenantId = structuredId.substring(0, 4); // Chars 0-3
    const departmentCode = structuredId.substring(4, 7); // Chars 4-6

    // Sign JWT
    const tokenPayload = { 
      id: user._id, 
      structuredId: user.structuredId, 
      role: user.role,
      tenantId,
      departmentCode
    };

    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        structuredId: user.structuredId,
        role: user.role,
        tenantId,
        departmentCode
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
