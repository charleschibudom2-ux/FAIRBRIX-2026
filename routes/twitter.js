const express = require('express');
const User = require('../models/User');
const { fetchContributionMetrics } = require('../services/twitterService');
const rewardService = require('../services/rewardService');
const router = express.Router();
router.post('/track-twitter', async (req, res) => {
  try {
    const { twitterHandle, userId } = req.body;
    if (!twitterHandle && !userId) {
      return res.status(400).json({ message: 'Provide a twitterHandle or userId' });
    }
    const filter = userId ? { _id: userId } : { twitterHandle: new RegExp(`^${twitterHandle}$`, 'i') };
    const user = await User.findOne(filter);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const metrics = await fetchContributionMetrics(user.twitterHandle);
    user.contributionScore = metrics.score;
    user.twitterTotals = {
      tweets: metrics.tweetCount,
      likes: metrics.likes,
      reposts: metrics.reposts,
      replies: metrics.replies,
    };
    user.totalScore = Math.round((user.quizScore || 0) + metrics.score);
    user.lastUpdated = new Date();
    await user.save();
    rewardService.issueReward(user);
    res.json({ metrics, totalScore: user.totalScore });
  } catch (error) {
    console.error('track-twitter', error);
    res.status(500).json({ message: error.message || 'Unable to track tweets' });
  }
});
module.exports = router;