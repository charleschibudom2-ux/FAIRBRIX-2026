app.use(session({
  name: 'fairbrix.session',
  keys: [process.env.SESSION_SECRET || 'change-this'],
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'none',
  secure: true,
}));