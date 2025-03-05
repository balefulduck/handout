import { getToken } from 'next-auth/jwt';
import { headers } from 'next/headers';

function getEnvInfo() {
    return {
        NEXTAUTH_SECRET: {
            exists: !!process.env.NEXTAUTH_SECRET,
            length: process.env.NEXTAUTH_SECRET?.length || 0
        },
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV
    };
}

let debugLog = [];

export async function GET(request) {
    try {
        const token = await getToken({ req: request });
        const headersList = headers();
        
        return new Response(JSON.stringify({
            debugLog,
            currentToken: token,
            headers: Object.fromEntries(headersList.entries()),
            environment: getEnvInfo()
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

export async function POST(request) {
    try {
        const body = await request.json();
        const token = await getToken({ req: request });
        const timestamp = new Date().toISOString();
        
        debugLog.push({
            timestamp,
            ...body,
            token,
            environment: getEnvInfo()
        });
        
        // Keep only last 100 entries
        if (debugLog.length > 100) {
            debugLog = debugLog.slice(-100);
        }
        
        return new Response(JSON.stringify({ success: true }), {
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
