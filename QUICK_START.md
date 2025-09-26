# Quick Start Guide

Get the Flex Reviews Dashboard up and running in minutes!

## 🚀 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Git

## ⚡ Quick Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/your-username/flex-reviews-dashboard.git
   cd flex-reviews-dashboard
   npm install
   ```

2. **Set up environment**
   ```bash
   # Create .env.local file
   cat > .env.local << EOF
   DATABASE_URL="postgresql://username:password@localhost:5432/flex_reviews"
   AUTH_SECRET="your-super-secret-jwt-key-here"
   HOSTAWAY_CLIENT_ID="your-hostaway-client-id"
   HOSTAWAY_CLIENT_SECRET="your-hostaway-client-secret"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   EOF
   ```

3. **Set up database**
   ```bash
   # Create database
   createdb flex_reviews
   
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data (optional)
   npx tsx scripts/seed-listings.ts
   npx tsx scripts/seed-reviews.ts
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Go to http://localhost:3000/sign-in
   - Create a manager account
   - Start managing reviews!

## 🔧 Common Issues

### Database Connection Error
```bash
# Check if PostgreSQL is running
pg_ctl status

# Start PostgreSQL if needed
pg_ctl start
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Environment Variables Missing
Make sure all required variables are set in `.env.local`:
- `DATABASE_URL`
- `AUTH_SECRET` 
- `HOSTAWAY_CLIENT_ID`
- `HOSTAWAY_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`

## 📱 Access Points

- **Sign-in**: http://localhost:3000/sign-in
- **Dashboard**: http://localhost:3000/dashboard
- **API Health**: http://localhost:3000/api/health

## 🎯 Next Steps

1. **Configure Hostaway API** - Add your real Hostaway credentials
2. **Customize UI** - Modify components in `/components`
3. **Add Features** - Extend functionality in `/lib/services`
4. **Deploy** - Use Netlify or Vercel for production

## 🆘 Need Help?

- Check the [full README](README.md) for detailed documentation
- Review [technical documentation](TECHNICAL_DOCUMENTATION.md)
- Check logs in the `logs/` directory
- Verify API health at `/api/health`

Happy coding! 🚀
