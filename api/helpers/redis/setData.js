const { redisClient } = require("../../config/constant");

exports.setData = async (role, userId, data) => {
  try {
    const key = `user:${role}:${userId}`;
    await redisClient.set(key, JSON.stringify(data), "EX", 3600 * 24); // Expires in 24 hours
  } catch (error) {
    console.error("Error setting user data in Redis:", error);
  }
};
