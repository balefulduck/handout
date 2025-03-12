import { getServerSession } from 'next-auth';
import dbUtils from '@/lib/db/utils';

export async function PUT(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { email } = await request.json();
        if (!email || typeof email !== 'string') {
            return new Response('Invalid email', { status: 400 });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response('Invalid email format', { status: 400 });
        }

        // Update the user's email
        const result = await dbUtils.updateUserEmail(session.user.id, email);
        if (!result) {
            return new Response('Failed to update email', { status: 500 });
        }

        return new Response('Email updated successfully', { status: 200 });
    } catch (error) {
        console.error('Error updating email:', error);
        return new Response('Internal server error', { status: 500 });
    }
}
