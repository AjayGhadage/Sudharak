import { db } from '../config/db.js';

export class UserModel {
  static findAll() {
    return db.read('users');
  }

  static findById(id) {
    const users = db.read('users');
    return users.find(u => u.id === Number(id));
  }

  static findByEmail(email) {
    const users = db.read('users');
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static findByGoogleId(googleId) {
    const users = db.read('users');
    return users.find(u => u.google_id === googleId);
  }

  static create(userData) {
    const users = db.read('users');
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 101,
      name: userData.name,
      email: userData.email,
      password_hash: userData.password_hash || null,
      google_id: userData.google_id || null,
      profile_image: userData.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
      auth_provider: userData.auth_provider || 'LOCAL',
      role: userData.role || 'CITIZEN',
      location: userData.location || 'Pune, India',
      karma: userData.karma || 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.push(newUser);
    db.write('users', users);
    return newUser;
  }

  static update(id, updateData) {
    const users = db.read('users');
    const index = users.findIndex(u => u.id === Number(id));
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    db.write('users', users);
    return users[index];
  }
}
