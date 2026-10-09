import { prisma } from '../config/prisma.js';

export class DonationModel {
  static async findAll() {
    return prisma.donation.findMany();
  }

  static async findByIssueId(issue_id) {
    return prisma.donation.findMany({ where: { issue_id: Number(issue_id) } });
  }

  static async create(data) {
    return prisma.donation.create({
      data: {
        issue_id: Number(data.issue_id),
        donor_id: Number(data.donor_id),
        amount: parseFloat(data.amount),
        paypal_order_id: data.paypal_order_id
      }
    });
  }

  static async updateStatusByOrderId(order_id, status) {
    return prisma.donation.update({
      where: { paypal_order_id: order_id },
      data: { status }
    });
  }

  static async updateStatus(id, status, capture_id = null) {
    return prisma.donation.update({
      where: { id: Number(id) },
      data: { status }
    });
  }
}
