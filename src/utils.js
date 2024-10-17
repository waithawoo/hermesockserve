export function verifyJWTToken(token) {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env('JWT_SECRET')
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
}

export async function verifySanctumToken(token) {
    const axios = require('axios');
    try {
        const response = await axios.get(`${LARAVEL_API_VERIFY_URL}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Token verification failed');
    }
}