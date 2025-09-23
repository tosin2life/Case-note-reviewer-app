This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Security & Production Checklist

Before deploying or enabling broader access, verify the following:

- HTTPS enforced in production (Vercel defaults to HTTPS)
- Secrets stored securely (Vercel env vars):
  - `GOOGLE_API_KEY`, `NEXTAUTH_SECRET`, `DATABASE_URL`
- Global security headers enabled (see `middleware.ts`):
  - CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- AI Endpoint protections (see `app/api/analyze-case/route.ts`):
  - Input redaction of basic PII via `redactPII` util
  - Lightweight per-IP rate limiting (15/min). For production scale, back with Redis.
  - Basic audit logging (ip, mode, tokens, timestamp)
- Input validation:
  - Case notes length and structure checked in UI and server
- Minimum user permissions:
  - Auth-protected pages (`/case-input`, `/analysis-results`, `/dashboard`)
- Monitoring & logging:
  - Review server logs for error trends and rate limit events
- Data handling:
  - Avoid storing raw PHI/PII in logs or long-term storage unless necessary
  - If storing cases (Task 7), add encryption-at-rest and access controls
