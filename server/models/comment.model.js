import { prisma } from '../config/prisma.js';

export class CommentModel {
  static async findByIssueId(issue_id) {
    return prisma.comment.findMany({
      where: { issue_id: Number(issue_id) },
      include: {
        user: { select: { name: true, profile_pic: true } }
      },
      orderBy: { created_at: 'asc' }
    });
  }

  static async create(data) {
    return prisma.comment.create({
      data: {
        issue_id: Number(data.issue_id),
        user_id: Number(data.user_id),
        content: data.content
      }
    });
  }
}
