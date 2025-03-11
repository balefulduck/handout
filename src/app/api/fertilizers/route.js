import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get unique fertilizer names and their usage count
    const fertilizers = db.prepare(`
      SELECT 
        fertilizer_name,
        COUNT(*) as usage_count,
        MAX(amount) as last_amount
      FROM fertilizer_usage
      GROUP BY fertilizer_name
      ORDER BY usage_count DESC, fertilizer_name ASC
    `).all();

    return Response.json({ fertilizers });
  } catch (error) {
    console.error('Error fetching fertilizers:', error);
    return Response.json({ error: 'Failed to fetch fertilizers' }, { status: 500 });
  }
}
