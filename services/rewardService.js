module.exports = {
  issueReward(user) {
    if (!user) return;
    console.log(`Placeholder reward: would disburse FBX reward to ${user.username} (score ${user.score}).`);
  },
};