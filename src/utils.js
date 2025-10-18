import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export function _generateSecretKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

export function _generateJWTToken(jwtSecret, payload, expiresIn = "7 days") {
    const token = jwt.sign(payload, jwtSecret, { expiresIn: expiresIn });
    return token
}
