#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Netlify build process...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
  }

  // Run Next.js build
  console.log('🔨 Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });

  // Create Netlify-specific files
  console.log('📁 Creating Netlify-specific files...');
  
  // Copy Next.js build to public directory
  console.log('📂 Copying Next.js build to public directory...');
  if (fs.existsSync('public')) {
    execSync('rm -rf public', { stdio: 'inherit' });
  }
  execSync('cp -r .next public', { stdio: 'inherit' });
  console.log('✅ Copied Next.js build to public directory');
  
  // Create _redirects file in public directory
  const redirectsContent = `# Netlify redirects file for Next.js App Router

# API routes
/api/* /api/:splat 200

# Handle client-side routing for all other routes
/* /index.html 200`;

  fs.writeFileSync('public/_redirects', redirectsContent);
  console.log('✅ Created _redirects file');

  // Create _headers file for security headers
  const headersContent = `# Netlify headers file

/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

*.jpg
  Cache-Control: public, max-age=31536000

*.png
  Cache-Control: public, max-age=31536000

*.webp
  Cache-Control: public, max-age=31536000`;

  fs.writeFileSync('public/_headers', headersContent);
  console.log('✅ Created _headers file');

  // Fix client reference manifest issues for Netlify
  console.log('🔧 Fixing client reference manifest issues...');
  
  // Create a comprehensive client reference manifest
  const clientReferenceManifest = {
    "clientModules": {},
    "ssrModuleMapping": {},
    "edgeSSRModuleMapping": {},
    "cssImports": {},
    "cssModules": {}
  };
  
  const manifestPaths = [
    'public/server/app/(dashboard)/page_client-reference-manifest.js',
    'public/server/app/(dashboard)/dashboard/page_client-reference-manifest.js',
    'public/server/app/(dashboard)/dashboard/analytics/page_client-reference-manifest.js',
    'public/server/app/(dashboard)/dashboard/properties/page_client-reference-manifest.js',
    'public/server/app/(dashboard)/dashboard/reviews/page_client-reference-manifest.js'
  ];
  
  manifestPaths.forEach(manifestPath => {
    const dir = path.dirname(manifestPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (fs.existsSync(manifestPath)) {
      console.log(`✅ Client reference manifest found: ${manifestPath}`);
    } else {
      console.log(`⚠️  Client reference manifest not found, creating: ${manifestPath}`);
    }
    
    // Always write the manifest to ensure it exists
    fs.writeFileSync(manifestPath, `module.exports = ${JSON.stringify(clientReferenceManifest, null, 2)};`);
  });
  
  // Also create a global client reference manifest if it doesn't exist
  const globalManifestPath = 'public/server/app/_client-reference-manifest.js';
  if (!fs.existsSync(globalManifestPath)) {
    console.log('📝 Creating global client reference manifest...');
    const globalDir = path.dirname(globalManifestPath);
    if (!fs.existsSync(globalDir)) {
      fs.mkdirSync(globalDir, { recursive: true });
    }
    fs.writeFileSync(globalManifestPath, `module.exports = ${JSON.stringify(clientReferenceManifest, null, 2)};`);
  }

  console.log('✅ Netlify build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
