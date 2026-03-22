const express = require('express');
const User = require('../models/User');
const rewardService = require('../services/rewardService');

const router = express.Router();

function ensureAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Login required' });
  }
  next();
}

router.post('/submit-quiz', ensureAuth, async (req, res) => {
  try {
    const { name, quizScore = 0, total = 0, futureVision, blockchain, testimonial, twitterLink } = req.body;
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const parsedScore = Number(quizScore) || 0;
    const parsedTotal = Number(total) || 0;
    const percentage = parsedTotal > 0 ? Math.round((parsedScore / parsedTotal) * 100) : 0;
    const contributionScore = user.contributionScore || 0;
    const totalScore = Math.round(parsedScore + contributionScore);

    user.displayName = name || user.displayName;
    user.quizScore = parsedScore;
    user.totalPossible = parsedTotal;
    user.percentage = percentage;
    user.totalScore = totalScore;
    user.lastUpdated = new Date();
    user.submittedSurvey = {
      futureVision: futureVision || '',
      blockchain: blockchain || '',
      testimonial: testimonial || '',
      twitterLink: twitterLink || '',
    };

    await user.save();

    rewardService.issueReward(user);

    res.json({
      message: 'Quiz saved',
      user: {
        twitterHandle: user.twitterHandle,
        totalScore: user.totalScore,
        contributionScore: user.contributionScore,
        quizScore: user.quizScore,
        percentage: user.percentage,
      },
    });
  } catch (error) {
    console.error('submit-quiz', error);
    res.status(500).json({ message: 'Unable to save quiz' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const users = await User.find()
      .sort({ totalScore: -1, updatedAt: -1 })
      .limit(limit)
      .lean();

    const leaderboard = users.map((user) => ({
      id: user._id,
      twitterHandle: user.twitterHandle,
      displayName: user.displayName,
      profileImage: user.profileImage,
      quizScore: user.quizScore,
      contributionScore: user.contributionScore,
      totalScore: user.totalScore,
      submittedSurvey: user.submittedSurvey,
      twitterTotals: user.twitterTotals,
      updatedAt: user.lastUpdated || user.updatedAt,
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('leaderboard', error);
    res.status(500).json({ message: 'Unable to load leaderboard' });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('user detail', error);
    res.status(500).json({ message: 'Unable to load user' });
  }
});

module.exports = router;
