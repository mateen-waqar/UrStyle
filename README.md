# StyleOS ✦ Premium Digital Wardrobe & 3D Interactive Fitting Studio

**StyleOS** is a digital wardrobe and intelligent outfit styling platform. Users catalog their existing clothing, footwear, timepieces, eyewear, and accessories. The system generates sartorial outfit harmonies using a **100% deterministic rule-based algorithm** (no external AI hallucinations or unpredictable API latency), visualized on interactive stylized-realistic 3D male and female avatars.

---

## Architecture: Modular Monolith

StyleOS is engineered as a clean **modular monolith**. Frontend presentation, backend persistence, business logic, deterministic rule engines, and WebGL 3D rendering are strictly separated into dedicated domain modules:

```
src/
├── app/                           # Next.js App Router (Pages, Layouts, Route Handlers)
│   ├── (auth)/                    # Authentication flows (Login, Register, Password Reset)
│   ├── (dashboard)/               # Core application experiences
│   │   ├── dashboard/             # Live closet statistics, recent items, and curated looks
│   │   ├── wardrobe/              # Digital wardrobe catalog with category filtering & upload
│   │   ├── outfits/               # Deterministic outfit generation engine
│   │   ├── builder/               # Custom manual outfit builder with live score breakdown
│   │   ├── saved-outfits/         # Bookmarked look archive with live database persistence
│   │   ├── calendar/              # Scheduled outfit calendar
│   │   ├── collections/           # Thematic capsules & lookbooks
│   │   └── settings/              # User preferences
│   ├── api/                       # Protected API Route Handlers with Zod validation & rate limits
│   └── studio/                    # Fullscreen 3D Virtual Studio with camera viewpoints & 2D fallback
├── components/
│   ├── layout/                    # Navbar, Sidebar, AppShell, Header, Footer
│   ├── common/                    # GarmentCard, OutfitCard, StatCard, EmptyState, SectionHeader
│   └── ui/                        # Reusable shadcn/ui-inspired primitives (Button, Card, Badge, etc.)
├── hooks/                         # Custom React hooks (useUser, useWardrobe, etc.)
├── lib/                           # Shared infrastructure clients (Prisma, Supabase SSR/Admin, rateLimit, utils)
├── modules/                       # Domain Modules (Separated into services, repos, validations, types)
│   ├── authentication/            # Supabase Auth session & AppUser mapping
│   ├── user-profile/              # Aesthetics, body shapes, fit preferences, onboarding validation
│   ├── digital-wardrobe/          # Garment catalog, metadata, wear tracking, ownership checking
│   ├── outfit-generation-engine/  # Deterministic rule matrices (color theory, proportion, formality)
│   ├── outfit-styling-engine/     # Styling advice (cuffs, rolls, French tucks, button stances)
│   ├── custom-outfit-builder/     # Manual multi-slot outfit creator
│   ├── avatar-engine/             # 3D avatar profile parameters & bone proportions
│   ├── 3d-virtual-studio/         # 3D garment asset catalog, PBR mapping & environment controls
│   ├── saved-outfits/             # Bookmarks, favorites, and transactional ensemble saving
│   ├── collections/               # Thematic boards & capsule management
│   └── outfit-calendar/           # Date & time scheduling for planned looks
├── stores/                        # Zustand global client state stores (wardrobe, outfit, avatar, studio)
├── three/                         # Three.js / React Three Fiber / Drei implementation
│   ├── avatars/                   # Stylized realistic 3D avatar meshes & anatomical rigs
│   ├── canvas/                    # WebGL StudioCanvas with Suspense & 2D fallback boundary
│   ├── garments/                  # Modular 3D garment renderer with layer collision offsets
│   ├── materials/                 # PBR fabric physics (cotton, wool, silk, leather, denim)
│   └── scene/                     # OrbitControls, CameraRig viewpoints, studio lighting rig
└── types/                         # Global TypeScript domain definitions and DTOs
```

---

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & ORM**: PostgreSQL via Prisma ORM
- **Authentication**: Supabase Auth (`AppUser.id` 1:1 mapped to `auth.users.id`)
- **Object Storage**: Supabase Storage (`wardrobe-items`, `avatar-models`, `garment-assets`)
- **State Management**: Zustand
- **Validation**: Zod (Strict schema parsing on all read/write endpoints)
- **Security & Protection**: In-memory sliding-window rate limiting & strict user resource isolation
- **3D Graphics Engine**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Testing**: Node.js native test runner (`node --test`) & Playwright (`@playwright/test`)

---

## Environment Variables

Configure the following variables in `.env.local`:

| Variable | Description | Exposure |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL pooled connection URL (Transaction mode, port 6543) | Server Only |
| `DIRECT_URL` | PostgreSQL direct connection URL (Session mode, port 5432) | Server Only |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project endpoint URL | Public / Client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public API key | Public / Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase administrative service role secret key | Server Only |
| `NEXT_PUBLIC_APP_URL` | Application root URL (e.g. `http://localhost:3000`) | Public / Client |

> [!WARNING]
> Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`. It is strictly used by server-side clients for administrative storage operations.

---

## Database Setup & Prisma Migrations

### 1. Supabase Storage Buckets
Create the following bucket in the Supabase Dashboard under **Storage**:
- `wardrobe-items` (Public read, authenticated user write: `${user.id}/*`)

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Push Schema to Database
To synchronize schema directly with your PostgreSQL database:
```bash
npm run prisma:push
```

To create and track formal SQL migrations:
```bash
npx prisma migrate dev --name init
```

---

## Development & Test Execution

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Comprehensive Test Suite
StyleOS includes 49 automated unit, integration, edge case, and rule engine tests:
```bash
npm test
```
The test suite covers:
- **Color Compatibility**: Monochromatic, complementary, triadic, neutral anchors, clashing penalties.
- **Rule Evaluation**: Occasion suitability, formality spread, seasonal climate physics, pattern balance.
- **Micro-Styling Engine**: French tuck, clean tuck, sleeve rolls, oversized volume balancing, blazer button rules.
- **Edge Cases**:
  - Empty wardrobe handling with diagnostic messaging.
  - Missing essential category detection (e.g. no footwear).
  - Formality mismatch penalties (black tie at casual outing / sweatpants at a gala).
  - Duplicate outfit elimination.
  - Laundry and archived garments filtering.
  - Fallback 3D garment template resolution.
  - Avatar switching and dimension clamping.
  - Image upload MIME-type and size validation.
- **Wardrobe CRUD & Isolation**: Zod schema validation and user ownership boundary enforcement.
- **Onboarding & Profiles**: Multi-step onboarding validation and human boundary clamping.
- **Outfit Saving**: Transactional ensemble creation with owned-item verification.

### Run End-to-End Tests (Playwright)
```bash
npm run test:e2e
```

### Typecheck & Production Build
```bash
npm run typecheck
npm run build
```

---

## Production Deployment Guide

### Deploying to Vercel
1. Push your repository to **GitHub**.
2. Import the repository into **Vercel**.
3. In the Vercel project settings, configure **Environment Variables**:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. In Build & Development Settings:
   - **Build Command**: `npx prisma generate && next build`
   - **Install Command**: `npm install`
5. Click **Deploy**.

---

## Security Architecture

1. **Authentication & Identity**: Every protected API route retrieves and verifies user identity directly via `supabase.auth.getUser()`. Client-supplied user IDs are never trusted.
2. **Resource Ownership Verification**: Every read, update, wear log, and delete operation on wardrobe items strictly filters by `where: { id, userId: user.id }`.
3. **Cross-User Protection on Outfit Creation**: Saving an outfit validates that all referenced `wardrobeItemId`s are owned by the authenticated user before executing the transaction.
4. **Input Sanitization**: All endpoint payloads are parsed through strict Zod schemas with character and value bounds.
5. **Rate Limiting**: Sliding-window rate limiters protect expensive outfit generation, custom creation, and image upload endpoints against denial-of-service attempts.
