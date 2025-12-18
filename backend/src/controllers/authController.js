import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

const TOKEN_EXPIRY = '2h';

function signToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { modules: { include: { module: true } } }
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user.id, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      modules: user.modules.map((m) => m.module.name)
    }
  });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
