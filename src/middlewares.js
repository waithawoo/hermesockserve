import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET
const [CUSTOM_HEADER_NAME, CUSTOM_HEADER_VALUE] =  process.env.CUSTOM_HEADERS.split(':')
const VALID_API_KEYS = process.env.VALID_API_KEYS.split(',')

export const http_apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (!apiKey || !VALID_API_KEYS.has(apiKey)) {
        return res.status(403).json({ error: 'Forbidden: Invalid API key' });
    }
    next(); 
};

export const http_jwtAuthMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(403).send('Authentication error: Token is missing');
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).send('Authentication error: Invalid token');
        req.userId = decoded.userId;
        next();
    });
};

export const http_customHeaderMiddleware = (req, res, next) => {
    const customHeaderValue = req.header(CUSTOM_HEADER_NAME);
    if (!customHeaderValue || customHeaderValue !== CUSTOM_HEADER_VALUE) {
        return res.status(403).json({ error: 'Forbidden: Invalid header value' });
    }
    next();
};

export const ws_jwtAuthMiddleware = (socket, next) => {
    const token = socket.handshake.auth.token;
    console.log('Received token:', token);
    console.log('JWT_SECRET token:', JWT_SECRET);

    if (!token) {
        return next(new Error("Authentication error: Token is missing")); 
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
        console.log('Decoded token data:', decoded);
        socket.user = decoded;
        next();
    });
}