# Dakar Scholarship Backend

## Installation

```bash
cd backend_dakar-scholarship-hub-main
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

## Archive

L archive zip du backend est disponible a cote du frontend sous le nom `dakar-scholarship-backend.zip`.

## CI configuration

This repository now includes a GitHub Actions workflow at `.github/workflows/ci.yml`.

The pipeline runs on each push and pull request and executes:

- `npm ci`
- `npm run prisma:generate`
- `npm run lint`
- `npm run build`

This helps catch linting, Prisma generation, and build issues before deployment.
