import { prisma } from '../config/prisma.js';
import bcrypt from 'bcryptjs';

export class UserModel {
  static async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
  }

  static async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'USER'
      }
    });
  }

  static async addKarma(userId, points) {
    return prisma.user.update({
      where: { id: Number(userId) },
      data: { karma_score: { increment: points } }
    });
  }
}
