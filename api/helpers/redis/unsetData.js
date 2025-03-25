const { redisClient } = require("../../config/constant");

exports.unsetData = async (role, userId, data) => {
  try {
    const key = `user:${role}:${userId}`;
    await redisClient.del(key);
  } catch (error) {
    console.error("Error deleting user data from Redis:", error);
  }
};
