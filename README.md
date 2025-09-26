# Flex Reviews Dashboard

A comprehensive property reviews management system for Flex Living, built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Live Demo

**Production URL**: https://splendorous-chaja-4be741.netlify.app

- **Sign-in Page**: https://splendorous-chaja-4be741.netlify.app/sign-in
- **Dashboard**: https://splendorous-chaja-4be741.netlify.app/dashboard
- **API Health Check**: https://splendorous-chaja-4be741.netlify.app/api/health

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- **Property Management**: View and manage property listings
- **Review Management**: Comprehensive review system with approval workflow
- **Analytics Dashboard**: Real-time insights and performance metrics
- **Hostaway Integration**: Seamless integration with Hostaway API
- **Authentication**: Secure manager authentication system

### Review Management
- **Review Approval Workflow**: Approve, reject, or mark reviews as public
- **Advanced Filtering**: Filter by rating, category, channel, time, property, and search
- **Grouping Options**: Group reviews by property, status, rating, or category
- **Bulk Operations**: Handle multiple reviews simultaneously
- **Real-time Updates**: Live data synchronization

### Analytics & Insights
- **Property Performance**: Track property ratings and review counts
- **Review Trends**: Analyze review patterns over time
- **Category Breakdown**: Detailed category-wise performance analysis
- **Geographic Insights**: Location-based analytics

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **SWR** - Data fetching and caching

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### External Integrations
- **Hostaway API** - Property management system integration
- **Winston** - Logging system
- **Rate Limiting** - API protection

### Development & Deployment
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Netlify** - Hosting and deployment
- **GitHub** - Version control

## 📁 Project Structure

```
flex-reviews-dashboard/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard routes
│   │   └── dashboard/
│   │       ├── analytics/       # Analytics page
│   │       ├── properties/      # Properties management
│   │       ├── reviews/         # Reviews management
│   │       └── page.tsx         # Dashboard home
│   ├── (login)/                 # Authentication routes
│   │   ├── sign-in/            # Sign-in page
│   │   └── sign-up/            # Sign-up page
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── listings/           # Property listings
│   │   ├── reviews/            # Review management
│   │   └── health/             # Health check
│   └── layout.tsx              # Root layout
├── components/                   # React components
│   ├── dashboard/              # Dashboard-specific components
│   ├── ui/                     # Reusable UI components
│   └── index.ts               # Component exports
├── lib/                        # Utility libraries
│   ├── auth/                  # Authentication utilities
│   ├── db/                    # Database configuration
│   ├── services/              # Business logic services
│   └── utils.ts              # General utilities
├── public/                     # Static assets
├── scripts/                    # Build and migration scripts
└── middleware.ts              # Next.js middleware
```

## 🔧 Prerequisites

Before running this project, ensure you have:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PostgreSQL** 14.x or higher
- **Git** for version control

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/flex-reviews-dashboard.git
   cd flex-reviews-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/flex_reviews"

# Authentication
AUTH_SECRET="your-super-secret-jwt-key-here"

# Hostaway API Integration
HOSTAWAY_CLIENT_ID="your-hostaway-client-id"
HOSTAWAY_CLIENT_SECRET="your-hostaway-client-secret"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Logging
LOG_LEVEL="info"
```

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `AUTH_SECRET` | JWT secret key | ✅ |
| `HOSTAWAY_CLIENT_ID` | Hostaway API client ID | ✅ |
| `HOSTAWAY_CLIENT_SECRET` | Hostaway API client secret | ✅ |
| `NEXT_PUBLIC_APP_URL` | Application base URL | ✅ |

## 🗄 Database Setup

1. **Create PostgreSQL database**
   ```bash
   createdb flex_reviews
   ```

2. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

3. **Seed the database (optional)**
   ```bash
   npx tsx scripts/seed-listings.ts
   npx tsx scripts/seed-reviews.ts
   ```

4. **Open Drizzle Studio (optional)**
   ```bash
   npm run db:studio
   ```

## 🚀 Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Access the application**
   - **Sign-in**: http://localhost:3000/sign-in
   - **Dashboard**: http://localhost:3000/dashboard

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run database migrations |
| `npm run db:generate` | Generate new migration |
| `npm run db:studio` | Open Drizzle Studio |

## 🏗 Building for Production

### Local Build
```bash
npm run build
npm run start
```

### Netlify Build
```bash
npm run build:netlify
```

### Vercel Build
```bash
npm run build:vercel
```

## 🚀 Deployment

### Netlify Deployment

1. **Connect your repository** to Netlify
2. **Set build settings**:
   - Build command: `npm run build:netlify`
   - Publish directory: `public`
3. **Configure environment variables** in Netlify dashboard
4. **Deploy**

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set build settings**:
   - Build command: `npm run build:vercel`
   - Output directory: `.next`
3. **Configure environment variables** in Vercel dashboard
4. **Deploy**

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/setup` - Initialize authentication
- `POST /api/manager` - Manager authentication

### Properties
- `GET /api/listings` - Get all properties
- `GET /api/listings/[id]` - Get specific property
- `GET /api/listings/stats` - Get property statistics

### Reviews
- `GET /api/reviews/hostaway` - Get reviews (with Hostaway integration)
- `POST /api/reviews/hostaway/[id]/approve` - Approve/reject review

### System
- `GET /api/health` - Health check endpoint

## 🔐 Authentication

The application uses JWT-based authentication with the following features:

- **Secure password hashing** with bcryptjs
- **JWT tokens** for session management
- **Protected routes** with middleware
- **Session persistence** across browser sessions

### Default Manager Account

For development, you can create a manager account through the sign-up page or use the API setup endpoint.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 📊 Monitoring & Logging

The application includes comprehensive logging with Winston:

- **Application logs**: General application events
- **Error logs**: Error tracking and debugging
- **Access logs**: API request logging
- **Performance logs**: Response time monitoring

Logs are stored in the `logs/` directory and rotated daily.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. **Check the logs** in the `logs/` directory
2. **Review the API health** at `/api/health`
3. **Check environment variables** are properly configured
4. **Verify database connection** and migrations

## 🔗 Links

- **Live Application**: https://splendorous-chaja-4be741.netlify.app
- **Technical Documentation**: [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)
- **API Documentation**: Available at `/api/health` endpoint

---

**Built with ❤️ for Flex Living**
