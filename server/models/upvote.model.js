import { prisma } from '../config/prisma.js';

export class UpvoteModel {
  static async findByIssueId(issueId) {
    return prisma.upvote.findMany({ where: { issue_id: Number(issueId) } });
  }

  static async hasUserUpvoted(issueId, userId) {
    const upvote = await prisma.upvote.findUnique({
      where: {
        issue_id_user_id: {
          issue_id: Number(issueId),
          user_id: Number(userId)
        }
      }
    });
    return !!upvote;
  }

  static async addUpvote(issueId, userId) {
    return prisma.upvote.create({
      data: {
        issue_id: Number(issueId),
        user_id: Number(userId)
      }
    });
  }

  static async removeUpvote(issueId, userId) {
    return prisma.upvote.delete({
      where: {
        issue_id_user_id: {
          issue_id: Number(issueId),
          user_id: Number(userId)
        }
      }
    });
  }
}
