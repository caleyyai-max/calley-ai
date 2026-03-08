# Calley AI - AI Phone Ordering for Restaurants

> Transform your restaurant's phone ordering with AI-powered voice agents that take orders, answer questions, and integrate directly with your POS system.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | NestJS, TypeScript, Socket.io |
| **Database** | Supabase (PostgreSQL) with Prisma ORM |
| **Auth** | Clerk |
| **AI Voice** | Vapi.ai + Twilio |
| **Payments** | Stripe |
| **Real-time** | Socket.io |

## Project Structure

```
calley-ai/
├── apps/
│   ├── web/                  # Next.js 14 frontend
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   ├── components/   # React components
│   │   │   └── lib/          # Utilities & helpers
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── api/                  # NestJS backend
│       ├── src/
│       │   ├── prisma/       # Prisma service & module
│       │   ├── restaurants/  # Restaurant management
│       │   ├── orders/       # Order processing
│       │   ├── calls/        # AI call handling
│       │   ├── menu/         # Menu management
│       │   ├── analytics/    # Dashboard analytics
│       │   ├── billing/      # Stripe billing
│       │   └── webhooks/     # External webhooks
│       └── package.json
├── prisma/
│   └── schema.prisma         # Database schema
├── .env.example              # Environment template
└── package.json              # Monorepo root
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- A Supabase project (free tier works)
- Clerk account
- Vapi.ai account
- Twilio account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/calley-ai.git
   cd calley-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Fill in all values in .env
   ```

4. **Generate Prisma client & push schema**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually
   npm run dev:web   # http://localhost:3000
   npm run dev:api   # http://localhost:3001
   ```

### Database Management

```bash
npm run db:generate   # Generate Prisma Client
npm run db:push       # Push schema to database
npm run db:migrate    # Create and run migrations
npm run db:studio     # Open Prisma Studio GUI
```

## Architecture

### How AI Phone Ordering Works

1. **Customer calls** the restaurant's Twilio phone number
2. **Twilio routes** the call to Vapi.ai voice agent
3. **Vapi.ai agent** converses with the customer using the restaurant's menu
4. **Order is created** via webhook to the NestJS API
5. **Restaurant dashboard** receives real-time order via Socket.io
6. **Restaurant confirms** the order through the web interface

### Subscription Tiers

| Feature | Free Trial | Starter | Growth | Enterprise |
|---------|-----------|---------|--------|------------|
| AI Calls/month | 50 | 500 | 2,000 | Unlimited |
| Menu Items | 25 | 100 | Unlimited | Unlimited |
| Analytics | Basic | Standard | Advanced | Custom |
| Support | Community | Email | Priority | Dedicated |

## Development

### Code Quality

```bash
npm run lint          # Run ESLint across all packages
npm run typecheck     # TypeScript type checking
npm run test          # Run all tests
```

### Building for Production

```bash
npm run build         # Build all packages
npm run build:web     # Build frontend only
npm run build:api     # Build backend only
```

## Deployment

### Frontend (Vercel)
- Connect your GitHub repo to Vercel
- Set root directory to `apps/web`
- Add all `NEXT_PUBLIC_*` environment variables

### Backend (Railway / Render / Fly.io)
- Set root directory to `apps/api`
- Set build command: `npm run build:api`
- Set start command: `npm run start:api`
- Add all server-side environment variables

### Database
- Supabase handles hosting, backups, and scaling automatically

## License

Private - All rights reserved.
