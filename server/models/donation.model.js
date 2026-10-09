import { db } from '../config/db.js';

export class DonationModel {
  static findAll() {
    return db.read('donations');
  }

  static findById(id) {
    const donations = db.read('donations');
    return donations.find(d => d.id === Number(id));
  }

  static findByIssueId(issueId) {
    const donations = db.read('donations');
    return donations.filter(d => d.issue_id === Number(issueId));
  }

  static findByDonorId(donorId) {
    const donations = db.read('donations');
    return donations.filter(d => d.donor_id === Number(donorId));
  }

  static create(donationData) {
    const donations = db.read('donations');
    const newDonation = {
      id: donations.length > 0 ? Math.max(...donations.map(d => d.id)) + 1 : 1,
      issue_id: Number(donationData.issue_id),
      donor_id: Number(donationData.donor_id),
      amount: parseFloat(donationData.amount),
      currency: donationData.currency || 'USD',
      paypal_order_id: donationData.paypal_order_id || null,
      paypal_capture_id: donationData.paypal_capture_id || null,
      status: donationData.status || 'PENDING',
      created_at: new Date().toISOString()
    };
    donations.push(newDonation);
    db.write('donations', donations);
    return newDonation;
  }

  static updateStatus(id, status, captureId = null) {
    const donations = db.read('donations');
    const index = donations.findIndex(d => d.id === Number(id));
    if (index === -1) return null;

    donations[index].status = status;
    if (captureId) donations[index].paypal_capture_id = captureId;
    db.write('donations', donations);
    return donations[index];
  }
}
