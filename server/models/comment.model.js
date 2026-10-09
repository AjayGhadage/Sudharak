import { db } from '../config/db.js';

export class CommentModel {
  static findByIssueId(issueId) {
    const comments = db.read('comments');
    const users = db.read('users');
    
    return comments
      .filter(c => c.issue_id === Number(issueId))
      .map(c => {
        const user = users.find(u => u.id === c.user_id);
        return {
          ...c,
          user_name: user ? user.name : 'Citizen',
          user_avatar: user ? user.profile_image : null
        };
      });
  }

  static create(commentData) {
    const comments = db.read('comments');
    const newComment = {
      id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
      issue_id: Number(commentData.issue_id),
      user_id: Number(commentData.user_id),
      content: commentData.content,
      created_at: new Date().toISOString()
    };
    comments.push(newComment);
    db.write('comments', comments);
    return newComment;
  }
}
