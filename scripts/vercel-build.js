#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
  }

  // Run Next.js build
  console.log('🔨 Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });

  // Fix client reference manifest issues
  console.log('🔧 Fixing client reference manifest issues...');
  const manifestPaths = [
    '.next/server/app/(dashboard)/page_client-reference-manifest.js',
    '.next/server/app/(dashboard)/dashboard/page_client-reference-manifest.js',
    '.next/server/app/(dashboard)/dashboard/analytics/page_client-reference-manifest.js',
    '.next/server/app/(dashboard)/dashboard/properties/page_client-reference-manifest.js',
    '.next/server/app/(dashboard)/dashboard/reviews/page_client-reference-manifest.js'
  ];
  
  manifestPaths.forEach(manifestPath => {
    if (fs.existsSync(manifestPath)) {
      console.log(`✅ Client reference manifest found: ${manifestPath}`);
    } else {
      console.log(`⚠️  Client reference manifest not found, creating placeholder: ${manifestPath}`);
      const dir = path.dirname(manifestPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(manifestPath, 'module.exports = {};');
    }
  });

  console.log('✅ Vercel build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
