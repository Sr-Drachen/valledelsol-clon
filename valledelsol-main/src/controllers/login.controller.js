const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const User = require('../models/user.model');

const getJWT = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  console.log(user.password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatches = await bcryptjs.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.MY_SECRET_KEY_JWT, {
    expiresIn: '2h',
  });
  res.json({ token });
};

const verifyJwt = (req, res) => {
  const { token } = req.body;
  try {
    jwt.verify(token, process.env.MY_SECRET_KEY_JWT);
    res.status(200).json({ isValidToken: true });
  } catch (error) {
    console.error('Invalid Token', error.message);
    res.status(403).json({ isValidToken: false });
  }
};

module.exports = { getJWT, verifyJwt };
