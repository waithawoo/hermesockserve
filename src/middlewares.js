import jwt from 'jsonwebtoken';

const createHttpApiKeyMiddleware = (validApiKeys) => {
    return (req, res, next) => {
        const apiKey = req.header('x-api-key');
        if (!apiKey || !validApiKeys.includes(apiKey)) {
            return res.status(403).json({ error: 'Authentication error: Invalid API key' });
        }
        next();
    };
};

const createHttpJwtAuthMiddleware = (jwtSecret) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(403).send('Authentication error: Token is missing');
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) return res.status(403).send('Authentication error: Invalid token');
            req.userId = decoded.userId;
            next();
        });
    };
};

const createHttpCustomHeaderMiddleware = (customHeader) => {
    return (req, res, next) => {
        const [customHeaderName, customHeaderValue] = customHeader.split(':');
        const customHeaderValueReceived = req.header(customHeaderName);
        if (!customHeaderValueReceived || customHeaderValueReceived !== customHeaderValue) {
            return res.status(403).json({ error: 'Authentication error: Invalid header value' });
        }
        next();
    };
};

const createWsApiKeyMiddleware = (validApiKeys) => {
    return (socket, next) => {
        const apiKey = socket.handshake.auth.token;
        if (!apiKey) {
            return next(new Error("Authentication error: apiKey is missing"));
        }
        if (!apiKey || !validApiKeys.includes(apiKey)) {
            return next(new Error("Authentication error: Invalid API key"));
        }
        next();
    };
};

const createWsJwtAuthMiddleware = (jwtSecret) => {
    return (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: Token is missing"));
        }
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                return next(new Error("Authentication error: Invalid token"));
            }
            socket.user = decoded;
            next();
        });
    };
}

const createWsAllowRequest = (customHeader) => {
    return (req, next) => {
        if(req.constructor.name == 'Socket'){
            next()
        }else{
            const [customHeaderName, customHeaderValue] = customHeader.split(':');
            const hasCustomHeader = req.headers[customHeaderName] !== undefined;
            const validCustomHeaderValue = req.headers[customHeaderName] === customHeaderValue;
            next(null, hasCustomHeader && validCustomHeaderValue);
        }
    };
}

export const createHttpMiddlewares = {
    'api-key': createHttpApiKeyMiddleware,
    'jwt': createHttpJwtAuthMiddleware,
    'custom-header': createHttpCustomHeaderMiddleware
};

export const createWsMiddlewares = {
    'api-key': createWsApiKeyMiddleware,
    'jwt': createWsJwtAuthMiddleware,
    'custom-header': createWsAllowRequest
};
