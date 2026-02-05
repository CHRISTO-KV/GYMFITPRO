// Simple auth middleware: read userId from header 'x-user-id' and attach to req.user
module.exports = (req, res, next) => {
  const userId = req.headers["x-user-id"]; // frontend will set this header
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = { _id: userId };
  next();
};