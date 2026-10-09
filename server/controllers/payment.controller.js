import { createOrder, capturePayment } from '../services/paypal.service.js';
import { DonationModel } from '../models/donation.model.js';
import { IssueModel } from '../models/issue.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const initiateDonation = async (req, res) => {
  try {
    const { issue_id, amount } = req.body;

    if (!issue_id || !amount || amount <= 0) {
      return sendError(res, 'Valid issue ID and amount are required', 400);
    }

    const issue = IssueModel.findById(issue_id);
    if (!issue) {
      return sendError(res, 'Issue not found', 404);
    }

    const order = await createOrder(parseFloat(amount));

    const donation = DonationModel.create({
      issue_id,
      donor_id: req.user.id,
      amount,
      paypal_order_id: order.id
    });

    return sendSuccess(res, 'Donation initiated', {
      orderId: order.id,
      donationId: donation.id
    });
  } catch (error) {
    console.error('Initiate donation error:', error);
    return sendError(res, 'Server error while initiating donation');
  }
};

export const captureDonation = async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) return sendError(res, 'Order ID is required', 400);

    const capture = await capturePayment(order_id);

    // Find the donation associated with this order
    const donations = DonationModel.findAll();
    const donation = donations.find(d => d.paypal_order_id === order_id);

    if (donation && donation.status === 'PENDING') {
      DonationModel.updateStatus(donation.id, 'COMPLETED', capture.id);
      IssueModel.addFunding(donation.issue_id, donation.amount);
    }

    return sendSuccess(res, 'Payment captured successfully', capture);
  } catch (error) {
    console.error('Capture donation error:', error);
    return sendError(res, 'Server error while capturing payment');
  }
};
