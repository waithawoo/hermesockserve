import crypto from 'crypto';

export function generateSecretKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}
const secretKey = generateSecretKey();
console.log('Generated Secret Key:', secretKey);
