const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  futureVision: String,
  blockchain: String,
  testimonial: String,
  twitterLink: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  twitterId: { type: String, required: true, unique: true },
  twitterHandle: String,
  displayName: String,
  profileImage: String,
  quizScore: { type: Number, default: 0 },
  totalPossible: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  contributionScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  submittedSurvey: surveySchema,
  twitterTotals: {
    tweets: Number,
    likes: Number,
    reposts: Number,
    replies: Number,
  },
  lastUpdated: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
