const { redisClient } = require("../../config/constant");

exports.getData = async (role, userId, data) => {
  try {
    const key = `user:${role}:${userId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting user data from Redis:", error);
    return null;
  }
};
