import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.split(' ')[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        modules: { include: { module: true } }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      modules: user.modules.map((m) => m.module.name)
    };

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
