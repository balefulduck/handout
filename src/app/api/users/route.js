import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Get all users
export async function GET() {
  try {
    const users = db.prepare(`
      SELECT id, username, created_at, onboarding_completed
      FROM users
    `).all();
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Create a new user
export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Check if username already exists
    const existingUser = db.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).get(username);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }
    
    // Hash the password
    const password_hash = await bcrypt.hash(password, 12);
    
    // Insert the new user
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, onboarding_completed)
      VALUES (?, ?, 0)
    `).run(username, password_hash);
    
    return NextResponse.json(
      { id: result.lastInsertRowid, username, created: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Update an existing user
export async function PUT(request) {
  try {
    const { id, username, password, onboarding_completed } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUser = db.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).get(id);
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if username is taken by another user
    if (username) {
      const userWithSameName = db.prepare(
        'SELECT id FROM users WHERE username = ? AND id != ?'
      ).get(username, id);
      
      if (userWithSameName) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
    }
    
    // Build update query dynamically based on provided fields
    let updateFields = [];
    let params = [];
    
    if (username) {
      updateFields.push('username = ?');
      params.push(username);
    }
    
    if (password) {
      const password_hash = await bcrypt.hash(password, 12);
      updateFields.push('password_hash = ?');
      params.push(password_hash);
    }
    
    if (onboarding_completed !== undefined) {
      updateFields.push('onboarding_completed = ?');
      params.push(onboarding_completed);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // Add id as the last parameter
    params.push(id);
    
    // Update the user
    db.prepare(`
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `).run(...params);
    
    return NextResponse.json(
      { id, updated: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete a user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUser = db.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).get(id);
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete the user
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    
    return NextResponse.json(
      { deleted: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
