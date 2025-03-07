import 'dotenv/config';
import jwt from 'jsonwebtoken';


if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined. Check your .env file!");
} else {
  console.log(" JWT_SECRET is loaded.");
}

const auth = (req, res, next) => {
  const tokenHeader = req.header('Authorization');
  console.log("Received Authorization Header:", tokenHeader);

  if (!tokenHeader) {
    return res.status(403).json({ message: 'Access Denied' });
  }

  const tokenParts = tokenHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(403).json({ message: 'Invalid Token Format' });
  }

  const extractedToken = tokenParts[1];
  console.log("Extracted Token:", extractedToken);

  try {
    const verified = jwt.verify(extractedToken, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

export default auth;
