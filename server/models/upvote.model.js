import { db } from '../config/db.js';

export class UpvoteModel {
  static find(issueId, userId) {
    const upvotes = db.read('upvotes');
    return upvotes.find(u => u.issue_id === Number(issueId) && u.user_id === Number(userId));
  }

  static toggle(issueId, userId) {
    const upvotes = db.read('upvotes');
    const index = upvotes.findIndex(u => u.issue_id === Number(issueId) && u.user_id === Number(userId));

    let isUpvoted = false;
    if (index > -1) {
      upvotes.splice(index, 1);
      isUpvoted = false;
    } else {
      upvotes.push({
        id: upvotes.length > 0 ? Math.max(...upvotes.map(u => u.id)) + 1 : 1,
        issue_id: Number(issueId),
        user_id: Number(userId),
        created_at: new Date().toISOString()
      });
      isUpvoted = true;
    }
    db.write('upvotes', upvotes);

    // Update count in issue
    const issueUpvotes = upvotes.filter(u => u.issue_id === Number(issueId)).length;
    const issues = db.read('issues');
    const issueIdx = issues.findIndex(i => i.id === Number(issueId));
    if (issueIdx > -1) {
      issues[issueIdx].upvotes = issueUpvotes;
      db.write('issues', issues);
    }

    return { isUpvoted, count: issueUpvotes };
  }

  static countByIssueId(issueId) {
    const upvotes = db.read('upvotes');
    return upvotes.filter(u => u.issue_id === Number(issueId)).length;
  }
}
