# Fiszki10DevX

Fiszki10DevX is a modern flashcard application designed for efficient learning through spaced repetition. It allows users to create and manage flashcard collections, study them in sessions, and track their progress. The application is built with Astro, React, and Supabase, providing a fast, dynamic, and scalable user experience.

## Tech Stack

- **Framework**: [Astro 5](https://astro.build/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Supabase](https://supabase.com/) (Database, Auth, Storage)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Testing (Unit & Integration)**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Testing (E2E)**: [Playwright](https://playwright.dev/)
- **API Testing**: [Supertest](https://github.com/ladjs/supertest)
- **API/Frontend Mocking**: [MSW](https://mswjs.io/)
- **CI/CD**: GitHub Actions (build, typecheck, lint, and deploy to GitHub Pages)

## Project Structure

The project follows a standard Astro application structure, with some conventions for organizing code:

```
.
├── public/                     # Public assets
└── src/
    ├── assets/                 # Static internal assets
    ├── components/             # Reusable components (React & Astro)
    │   ├── auth/
    │   ├── collections/
    │   ├── common/
    │   ├── dashboard/
    │   ├── layout/
    │   └── ui/                 # Shadcn/ui components
    ├── db/                     # Supabase client and generated types
    ├── layouts/                # Astro layout components
    ├── lib/                    # Services, helpers, and utilities
    │   ├── schemas/
    │   ├── services/
    │   └── utils/
    ├── middleware/             # Astro middleware
    ├── pages/                  # Astro pages and API endpoints
    │   └── api/
    ├── styles/                 # Global styles
    ├── types/                  # Shared TypeScript types
    └── env.d.ts                # Environment variable type definitions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, pnpm, or yarn
- A Supabase account and a new project.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/Fiszki10DevX.git
    cd Fiszki10DevX
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Supabase project URL and anon key:

    ```env
    PUBLIC_SUPABASE_URL="your-supabase-url"
    PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:4321`.

## Database

The project uses Supabase for the database. The schema is managed through migration files located in the `supabase/migrations` directory.

To apply the latest schema to your Supabase instance, you can use the Supabase CLI:

```bash
npx supabase db push
```

## Key Features

- **User Authentication**: Secure sign-up and login with Supabase Auth.
- **Flashcard Collections**: Create, edit, and delete collections of flashcards.
- **Flashcard Management**: Add, update, and remove flashcards within collections.
- **Study Sessions**: Start study sessions based on different modes (learn, review, mixed).
- **Spaced Repetition**: An algorithm schedules flashcards for review at optimal intervals to improve memory retention.
