import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';

export async function listUsers(_req, res) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { modules: { include: { module: true } } }
  });

  const payload = users.map((user) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    modules: user.modules.map((m) => m.module.name)
  }));

  res.json({ users: payload });
}

export async function createUser(req, res) {
  const { email, password, role = 'USER', modules = [] } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const moduleRecords = await connectModules(modules);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashed,
        role,
        isActive: true,
        modules: { create: moduleRecords }
      },
      include: { modules: { include: { module: true } } }
    });

    res.status(201).json(formatUser(user));
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function updateStatus(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'isActive must be a boolean' });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      include: { modules: { include: { module: true } } }
    });

    res.json(formatUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update status' });
  }
}

export async function updateModules(req, res) {
  const { id } = req.params;
  const { modules = [] } = req.body;

  try {
    const moduleRecords = await connectModules(modules);

    await prisma.userModule.deleteMany({ where: { userId: id } });

    const user = await prisma.user.update({
      where: { id },
      data: {
        modules: {
          create: moduleRecords
        }
      },
      include: { modules: { include: { module: true } } }
    });

    res.json(formatUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update modules' });
  }
}

async function connectModules(moduleNames = []) {
  const uniqueNames = [...new Set(moduleNames)].filter(Boolean);

  const modules = await Promise.all(
    uniqueNames.map(async (name) =>
      prisma.module.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );

  return modules.map((module) => ({ module: { connect: { id: module.id } } }));
}

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    modules: user.modules.map((m) => m.module.name)
  };
}
