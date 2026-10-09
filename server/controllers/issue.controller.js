import { IssueModel } from '../models/issue.model.js';
import { UpvoteModel } from '../models/upvote.model.js';
import { CommentModel } from '../models/comment.model.js';
import { analyzeImageWithML } from '../services/ml.service.js';
import { generateAIReasoning } from '../services/groq.service.js';
import { uploadToS3 } from '../services/s3.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const analyzeIssue = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file uploaded', 400);
    }

    const mlResult = await analyzeImageWithML(req.file.path);
    if (!mlResult.success) {
      return sendError(res, 'Failed to process image with ML', 500);
    }

    // Non-civic anomaly detection check (e.g., if confidence is too low or not a civic issue)
    if (mlResult.data?.isNonCivic) {
      return sendError(
        res,
        'No supported civic anomaly detected in this photo. Please upload a clear image showing Potholes, Garbage Dumps, Water Leaks, or Streetlights.',
        422
      );
    }

    const aiAnalysis = await generateAIReasoning(mlResult.data.analysis);
    const imageUrl = await uploadToS3(req.file.path, req.file.filename);

    // Calculate indicative INR cost range (1 USD = ₹83 baseline)
    const costBaselineUsd = aiAnalysis.estimatedCost || 180;
    const costInr = Math.round(costBaselineUsd * 83);
    const costMinInr = Math.round(costInr * 0.85);
    const costMaxInr = Math.round(costInr * 1.25);

    // Transparent AI Explanation
    const aiExplanation = {
      detectionConfidence: `${Math.round((aiAnalysis.confidence || 0.91) * 100)}%`,
      severityReason: `Classified as ${aiAnalysis.severity} due to detected surface defect area, depth, and public safety impact score (${aiAnalysis.priorityScore}/100).`,
      costDisclaimer: `Indicative AI range ₹${costMinInr.toLocaleString('en-IN')}–₹${costMaxInr.toLocaleString('en-IN')}. Actual municipal quotation subject to PMC Ward Engineer inspection.`,
      category: aiAnalysis.category || 'POTHOLE',
      costMinInr,
      costMaxInr,
      costInr
    };

    // Duplicate Check
    const allIssues = IssueModel.findAll();
    const category = aiAnalysis.category || mlResult.data.detection.category || 'POTHOLE';

    const existingIssue = allIssues.find(issue => 
      issue.category === category ||
      (issue.image_url && issue.image_url.includes(req.file.filename)) ||
      (req.body.location && issue.location.toLowerCase().includes(req.body.location.toLowerCase()))
    );

    let duplicateCheck = null;
    if (existingIssue) {
      duplicateCheck = {
        isDuplicate: true,
        issueId: existingIssue.id,
        title: existingIssue.title,
        status: existingIssue.status,
        location: existingIssue.location,
        resolvedAt: existingIssue.updated_at,
        upvotes: existingIssue.upvotes || 0,
        message: existingIssue.status === 'RESOLVED' 
          ? `This ${category.toLowerCase().replace('_', ' ')} issue was previously marked RESOLVED on ${new Date(existingIssue.updated_at).toLocaleDateString()}. Is the problem recurring?`
          : `An active ${category.toLowerCase().replace('_', ' ')} issue is already registered at this location.`
      };
    }

    return sendSuccess(res, 'Image analyzed successfully', {
      detection: mlResult.data.detection,
      analysis: aiAnalysis,
      imageUrl,
      aiExplanation,
      duplicateCheck
    });
  } catch (error) {
    console.error('Issue analysis error:', error);
    return sendError(res, 'Server error during issue analysis');
  }
};

export const createIssue = async (req, res) => {
  try {
    const issueData = { ...req.body, user_id: req.user.id };
    
    if (!issueData.title || !issueData.category || !issueData.image_url) {
      return sendError(res, 'Title, category, and image_url are required', 400);
    }
    
    const newIssue = IssueModel.create(issueData);
    return sendSuccess(res, 'Issue created successfully', newIssue, 201);
  } catch (error) {
    console.error('Create issue error:', error);
    return sendError(res, 'Server error while creating issue');
  }
};

export const reopenIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = IssueModel.findById(id);
    if (!issue) return sendError(res, 'Issue not found', 404);

    const updated = IssueModel.update(id, {
      status: 'REPORTED',
      priority_score: Math.min(100, (issue.priority_score || 70) + 15),
      recurring: true,
      upvotes: (issue.upvotes || 0) + 1,
      ai_description: `${issue.ai_description || ''} [RECURRENCE REPORTED BY CITIZEN on ${new Date().toLocaleDateString()}]`
    });

    return sendSuccess(res, 'Issue successfully re-opened and flagged as recurring hazard', updated);
  } catch (error) {
    console.error('Reopen issue error:', error);
    return sendError(res, 'Server error while reopening issue');
  }
};

export const acceptIssueByOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = IssueModel.findById(id);
    if (!issue) return sendError(res, 'Issue not found', 404);

    // Municipal Officers, Admins, and Government accounts can accept issues
    if (!['MUNICIPAL_OFFICER', 'ADMIN', 'GOVERNMENT'].includes(req.user.role)) {
      return sendError(res, 'Only Municipal Officers can update repair status', 403);
    }

    const updated = IssueModel.update(id, {
      status: 'IN_PROGRESS',
      repaired_by: req.user.name || 'PMC Ward Infrastructure Engineer',
      verification_level: 'OFFICIALLY_VERIFIED'
    });

    return sendSuccess(res, 'Issue accepted into repair queue by Municipal Officer', updated);
  } catch (error) {
    return sendError(res, 'Server error accepting issue');
  }
};

export const resolveIssueWithProof = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = IssueModel.findById(id);
    if (!issue) return sendError(res, 'Issue not found', 404);

    if (!['MUNICIPAL_OFFICER', 'ADMIN', 'GOVERNMENT'].includes(req.user.role)) {
      return sendError(res, 'Only Municipal Officers can upload repair proof & resolve issues', 403);
    }

    let proofImageUrl = issue.image_url;
    if (req.file) {
      proofImageUrl = await uploadToS3(req.file.path, req.file.filename);
    } else if (req.body.repair_proof_image) {
      proofImageUrl = req.body.repair_proof_image;
    }

    const resolvedIssue = IssueModel.resolveWithProof(id, {
      repair_proof_image: proofImageUrl,
      repair_proof_notes: req.body.notes || 'Repair completed according to PMC engineering standards.',
      repaired_by: req.user.name || 'PMC Municipal Contractor'
    });

    return sendSuccess(res, 'Issue officially resolved with repair proof verification', resolvedIssue);
  } catch (error) {
    console.error('Resolve issue error:', error);
    return sendError(res, 'Server error resolving issue');
  }
};

export const getIssues = (req, res) => {
  try {
    const issues = IssueModel.findAll();
    return sendSuccess(res, 'Issues retrieved successfully', issues.sort((a, b) => b.id - a.id));
  } catch (error) {
    return sendError(res, 'Server error while fetching issues');
  }
};

export const getIssueById = (req, res) => {
  try {
    const { id } = req.params;
    const issue = IssueModel.findById(id);
    if (!issue) return sendError(res, 'Issue not found', 404);

    const comments = CommentModel.findByIssueId(id);
    
    let hasUpvoted = false;
    if (req.user) {
      const upvote = UpvoteModel.find(id, req.user.id);
      if (upvote) hasUpvoted = true;
    }

    return sendSuccess(res, 'Issue retrieved successfully', {
      ...issue,
      comments,
      hasUpvoted
    });
  } catch (error) {
    return sendError(res, 'Server error while fetching issue');
  }
};

export const toggleUpvote = (req, res) => {
  try {
    const { id } = req.params;
    const issue = IssueModel.findById(id);
    if (!issue) return sendError(res, 'Issue not found', 404);

    const result = UpvoteModel.toggle(id, req.user.id);
    return sendSuccess(res, result.isUpvoted ? 'Upvoted' : 'Upvote removed', result);
  } catch (error) {
    return sendError(res, 'Server error while upvoting');
  }
};

export const addComment = (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return sendError(res, 'Comment content is required', 400);

    const issue = IssueModel.findById(id);
    if (!issue) return sendError(res, 'Issue not found', 404);

    const newComment = CommentModel.create({
      issue_id: id,
      user_id: req.user.id,
      content
    });

    return sendSuccess(res, 'Comment added', {
      ...newComment,
      user_name: req.user.name,
      user_avatar: req.user.profile_image
    }, 201);
  } catch (error) {
    return sendError(res, 'Server error while commenting');
  }
};
