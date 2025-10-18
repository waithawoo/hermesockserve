#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { _generateSecretKey, _generateJWTToken } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
    console.log(`
HermesockServe CLI Tool

Usage: hermesockserve <command> [options]

Commands:
  generate-secret [length]           Generate a secret key (default length: 32)
  generate-jwt <secret> [payload]    Generate a JWT token with given secret
  help                              Show this help message

Examples:
  hermesockserve generate-secret
  hermesockserve generate-secret 64
  hermesockserve generate-jwt mySecretKey
  hermesockserve generate-jwt mySecretKey '{"userId": 123, "role": "admin"}'

Note: After installing globally with 'npm install -g hermesockserve', 
      you can use 'hermesockserve' command from anywhere. Locally, you can use npx hermesockserve
    `);
}

function generateSecret() {
    const length = args[1] ? parseInt(args[1]) : 32;
    
    if (isNaN(length) || length < 1) {
        console.error('Error: Length must be a positive number');
        process.exit(1);
    }
    
    const secret = _generateSecretKey(length);
    console.log('Generated Secret Key:');
    console.log(secret);
}

function generateJWT() {
    const secret = args[1];
    
    if (!secret) {
        console.error('Error: JWT secret is required');
        console.log('Usage: hermesockserve generate-jwt <secret> [payload]');
        process.exit(1);
    }
    
    let payload;
    if (args[2]) {
        try {
            payload = JSON.parse(args[2]);
        } catch (error) {
            console.error('Error: Invalid JSON payload');
            console.error('Payload must be valid JSON string');
            process.exit(1);
        }
    }
    
    try {
        const token = _generateJWTToken(secret, payload);
        console.log('Generated JWT Token:');
        console.log(token);
    } catch (error) {
        console.error('Error generating JWT token:', error.message);
        process.exit(1);
    }
}

switch (command) {
    case 'generate-secret':
        generateSecret();
        break;
    
    case 'generate-jwt':
        generateJWT();
        break;
    
    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;
    
    default:
        if (!command) {
            console.error('Error: No command specified');
        } else {
            console.error(`Error: Unknown command '${command}'`);
        }
        showHelp();
        process.exit(1);
}
