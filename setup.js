#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Book Review Platform...\n');

// Create backend .env file
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvContent = `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookreview?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random-${Math.random().toString(36).substring(2, 15)}
PORT=5000
NODE_ENV=development`;

if (!fs.existsSync(backendEnvPath)) {
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Created backend/.env file');
} else {
  console.log('⚠️  backend/.env already exists');
}

// Create frontend .env.local file
const frontendEnvPath = path.join(__dirname, '.env.local');
const frontendEnvContent = `VITE_API_URL=http://localhost:5000/api`;

if (!fs.existsSync(frontendEnvPath)) {
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('⚠️  .env.local already exists');
}

console.log('\n📋 Next steps:');
console.log('1. Update the MONGODB_URI in backend/.env with your actual MongoDB connection string');
console.log('2. Install dependencies:');
console.log('   - Backend: cd backend && npm install');
console.log('   - Frontend: npm install');
console.log('3. Start the application:');
console.log('   - Backend: cd backend && npm run dev');
console.log('   - Frontend: npm run dev');
console.log('\n🎉 Happy coding!');
