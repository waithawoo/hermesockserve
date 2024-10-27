import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export function _generateSecretKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

export function _generateJWTToken(jwtSecret, payload, expiresIn = "7 days") {
    payload = payload || {'domain' : 'uoctech.com', 'random': '17a3828ab6aebc77c5843299b26b9b43fbce988c3171e6170049ebc08a116b46'};
    const token = jwt.sign(payload, jwtSecret, { expiresIn: expiresIn });
    return token
}