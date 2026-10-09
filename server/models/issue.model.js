import { prisma } from '../config/prisma.js';

export class IssueModel {
  static async findAll() {
    return prisma.issue.findMany({
      include: { user: { select: { name: true, profile_pic: true } } },
      orderBy: { created_at: 'desc' }
    });
  }

  static async findById(id) {
    return prisma.issue.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { name: true, profile_pic: true, email: true } },
        timeline_events: true,
        donations: true,
        comments: { include: { user: { select: { name: true, profile_pic: true } } }, orderBy: { created_at: 'asc' } },
        issue_upvotes: true
      }
    });
  }

  static async create(data) {
    let verificationLevel = 'AI_VERIFIED';
    if (data.upvotes >= 3) verificationLevel = 'COMMUNITY_VERIFIED';

    const costBaseline = parseFloat(data.estimated_cost) || 180;
    const costInr = Math.round(costBaseline * 83);
    const costMinInr = Math.round(costInr * 0.85);
    const costMaxInr = Math.round(costInr * 1.25);

    const issue = await prisma.issue.create({
      data: {
        user_id: data.user_id,
        title: data.title || 'Civic Infrastructure Defect',
        description: data.description || '',
        ai_description: data.ai_description || '',
        category: data.category || 'POTHOLE',
        severity: data.severity || 'HIGH',
        confidence: parseFloat(data.confidence) || 0.91,
        location: data.location || 'Pune, Maharashtra',
        lat: data.lat || 18.5204,
        lng: data.lng || 73.8567,
        verification_level: verificationLevel,
        image_url: data.image_url || '',
        funding_goal: costInr,
        cost_min_inr: costMinInr,
        cost_max_inr: costMaxInr,
        priority_score: data.priority_score || 75,
        timeline_events: {
          create: [
            { title: 'Report Logged', status: 'done', desc: 'Geotagged citizen report submitted' },
            { title: 'AI Diagnostics', status: 'done', desc: `Verified category ${data.category || 'POTHOLE'} with ${Math.round((data.confidence || 0.91) * 100)}% confidence` },
            { title: 'Ward Officer Acceptance', status: 'pending', desc: 'Awaiting PMC Ward Engineer review' },
            { title: 'Repair In Progress', status: 'pending', desc: 'Contractor assigned & escrow released' },
            { title: 'Repair Verified & Resolved', status: 'pending', desc: 'Before/After proof inspection' }
          ]
        }
      }
    });

    return issue;
  }

  static async update(id, updateData) {
    let verificationLevel = undefined;
    if (updateData.status === 'IN_PROGRESS' || updateData.status === 'RESOLVED') {
      verificationLevel = 'OFFICIALLY_VERIFIED';
    }

    return prisma.issue.update({
      where: { id: Number(id) },
      data: {
        ...updateData,
        ...(verificationLevel ? { verification_level: verificationLevel } : {})
      }
    });
  }

  static async addFunding(id, amount) {
    return prisma.issue.update({
      where: { id: Number(id) },
      data: { funding_raised: { increment: parseFloat(amount) } }
    });
  }

  static async resolveWithProof(id, proofData) {
    return prisma.issue.update({
      where: { id: Number(id) },
      data: {
        repair_proof_image: proofData.image_url,
        repair_proof_notes: proofData.notes,
        status: 'VERIFIED',
        verification_level: 'OFFICIALLY_VERIFIED',
        repaired_by: proofData.contractor_name || 'Verified Civic Contractor',
        resolved_at: new Date(),
        timeline_events: {
          create: {
            title: 'Repair Verified & Resolved',
            desc: `Before/After proof inspection approved. Repair done by ${proofData.contractor_name || 'Verified Civic Contractor'}.`,
            status: 'done'
          }
        }
      }
    });
  }
}
