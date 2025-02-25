import db from "@/lib/db";

export async function GET() {
    try {
        const users = db.prepare('SELECT username, password_hash FROM users').all();
        const strains = db.prepare('SELECT id, name FROM strains').all();
        
        return new Response(JSON.stringify({
            users: users,
            strains: strains
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
