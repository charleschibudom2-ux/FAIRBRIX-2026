const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const connectMongo = require('./config/mongo');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const twitterRoutes = require('./routes/twitter');
dotenv.config();
const app = express();
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));
connectMongo();
app.use('/auth', authRoutes);
app.use('/api', quizRoutes);
app.use('/api', twitterRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Fairbrix backend listening on port ${PORT}`);
});