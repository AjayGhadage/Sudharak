import { db } from '../config/db.js';

export class IssueModel {
  static findAll() {
    return db.read('issues');
  }

  static findById(id) {
    const issues = db.read('issues');
    return issues.find(i => i.id === Number(id));
  }

  static create(data) {
    const issues = db.read('issues');
    
    // Calculate verification level based on initial input
    let verificationLevel = 'AI_VERIFIED';
    if (data.upvotes >= 3) verificationLevel = 'COMMUNITY_VERIFIED';

    const costBaseline = parseFloat(data.estimated_cost) || 180;
    const costInr = Math.round(costBaseline * 83);
    const costMinInr = Math.round(costInr * 0.85);
    const costMaxInr = Math.round(costInr * 1.25);

    const newIssue = {
      id: issues.length > 0 ? Math.max(...issues.map(i => i.id)) + 1 : 101,
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
      status: 'REPORTED', // REPORTED -> IN_PROGRESS -> RESOLVED -> VERIFIED
      verification_level: verificationLevel, // AI_VERIFIED, COMMUNITY_VERIFIED, OFFICIALLY_VERIFIED
      escrow_status: 'HELD_IN_ESCROW', // HELD_IN_ESCROW, RELEASED_TO_CONTRACTOR, REFUNDED
      escrow_beneficiary: 'PMC Infrastructure Ward #14 Dept / Verified NGO Partner',
      escrow_disclaimer: 'Indicative AI estimate. Funds locked safely in Municipal Escrow Vault until repair proof verification.',
      image_url: data.image_url || '',
      repair_proof_image: null,
      repair_proof_notes: null,
      repaired_by: null,
      resolved_at: null,
      funding_goal: costInr,
      cost_min_inr: costMinInr,
      cost_max_inr: costMaxInr,
      funding_raised: 0.00,
      upvotes: 0,
      priority_score: data.priority_score || 75,
      escalated: false,
      escalated_at: null,
      timeline: [
        { title: 'Report Logged', date: new Date().toISOString(), status: 'done', desc: 'Geotagged citizen report submitted' },
        { title: 'AI Diagnostics', date: new Date().toISOString(), status: 'done', desc: `Verified category ${data.category || 'POTHOLE'} with ${Math.round((data.confidence || 0.91) * 100)}% confidence` },
        { title: 'Ward Officer Acceptance', date: null, status: 'pending', desc: 'Awaiting PMC Ward Engineer review' },
        { title: 'Repair In Progress', date: null, status: 'pending', desc: 'Contractor assigned & escrow released' },
        { title: 'Repair Verified & Resolved', date: null, status: 'pending', desc: 'Before/After proof inspection' },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    issues.push(newIssue);
    db.write('issues', issues);
    return newIssue;
  }

  static update(id, updateData) {
    const issues = db.read('issues');
    const index = issues.findIndex(i => i.id === Number(id));
    if (index === -1) return null;

    const current = issues[index];
    const updatedUpvotes = (updateData.upvotes !== undefined) ? updateData.upvotes : current.upvotes;
    
    let verificationLevel = current.verification_level;
    if (updatedUpvotes >= 3 && verificationLevel === 'AI_VERIFIED') {
      verificationLevel = 'COMMUNITY_VERIFIED';
    }
    if (updateData.status === 'IN_PROGRESS' || updateData.status === 'RESOLVED') {
      verificationLevel = 'OFFICIALLY_VERIFIED';
    }

    issues[index] = { 
      ...current, 
      ...updateData, 
      verification_level: verificationLevel,
      updated_at: new Date().toISOString() 
    };

    db.write('issues', issues);
    return issues[index];
  }

  static resolveWithProof(id, proofData) {
    const issues = db.read('issues');
    const index = issues.findIndex(i => i.id === Number(id));
    if (index === -1) return null;

    const current = issues[index];
    const now = new Date().toISOString();

    const updatedTimeline = current.timeline.map(item => {
      if (item.title.includes('Ward Officer') || item.title.includes('Repair In Progress')) {
        return { ...item, status: 'done', date: item.date || now };
      }
      if (item.title.includes('Resolved')) {
        return { ...item, status: 'done', date: now, desc: `Verified with proof image by ${proofData.repaired_by || 'PMC Ward Team'}` };
      }
      return item;
    });

    issues[index] = {
      ...current,
      status: 'RESOLVED',
      verification_level: 'OFFICIALLY_VERIFIED',
      escrow_status: 'RELEASED_TO_CONTRACTOR',
      repair_proof_image: proofData.repair_proof_image,
      repair_proof_notes: proofData.repair_proof_notes || 'Municipal repair completed & visually verified.',
      repaired_by: proofData.repaired_by || 'PMC Municipal Contractor',
      resolved_at: now,
      timeline: updatedTimeline,
      updated_at: now
    };

    db.write('issues', issues);
    return issues[index];
  }

  static addFunding(id, amount) {
    const issues = db.read('issues');
    const index = issues.findIndex(i => i.id === Number(id));
    if (index === -1) return null;
    issues[index].funding_raised = parseFloat((issues[index].funding_raised + parseFloat(amount)).toFixed(2));
    issues[index].updated_at = new Date().toISOString();
    db.write('issues', issues);
    return issues[index];
  }
}
