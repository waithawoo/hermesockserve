import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';

export function verifyJWTToken(token) {
    const JWT_SECRET = process.env.JWT_SECRET
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
}

// export async function verifySanctumToken(token) {
//     try {
//         const response = await axios.get(`${LARAVEL_API_VERIFY_URL}`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         throw new Error('Token verification failed');
//     }
// }

export function generateSecretKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

export function generateJWTToken(payload) {
    const JWT_SECRET = process.env.JWT_SECRET

    payload = payload || {'role' : 'guest'};

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    return token
}