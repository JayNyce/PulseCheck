# PulseCheck: A Student Feedback Application

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). PulseCheck is a simple and elegant feedback app for students to provide feedback on courses.

## Getting Started

### 1. **Clone the repository:**

```bash
git clone [https://github.com/JayNyce/PulseCheck.git]
cd your-repository-folder
```

### 2. **Install dependencies:**

Before running the project, install the necessary dependencies.

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. **Set up environment variables:**

The project requires a set of environment variables to be defined. These variables include database credentials, secrets, and API-related information.

Create a `.env.local` file in the root directory based on the `.env.example` file.

```bash
cp .env.example .env.local
```

Fill in the values for each variable in `.env.local`:

```env
POSTGRES_URL="your_database_url_here"
POSTGRES_USER="your_database_user_here"
POSTGRES_PASSWORD="your_database_password_here"
POSTGRES_DATABASE="your_database_name_here"

NEXTAUTH_URL=http://localhost:3000  # Replace with your actual URL in production
NEXTAUTH_SECRET=your_generated_secret_here
```

- **Note**: Make sure you generate a new `NEXTAUTH_SECRET` for your local setup. You can generate one using:
  ```bash
  openssl rand -base64 32
  ```

### 4. **Database Setup:**

Make sure that your PostgreSQL database is set up and accessible. Once your environment variables are in place, you need to migrate your Prisma schema to your database.

Run the following Prisma commands to set up the database schema:

```bash
npx prisma migrate dev
```

This will apply the necessary database schema migrations to your local database.

### 5. **Run the development server:**

Once everything is set up, start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

You can start editing the page by modifying `src/app/page.tsx`. The page will auto-update as you make changes.

### 6. **Database Operations:**

If you want to inspect or manage your database, you can use Prisma Studio:

```bash
npx prisma studio
```

This opens a web-based UI to explore your database content.

###8. *Install Framer Motion and react_slick_carousel for dynamic animations on UI*
Run the below two commands to make sure the dynamic animations on UI work:
1. npm install react-slick slick-carousel
2. npm install framer-motion

### 7. **Learn More**

To learn more about Next.js and its features, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - interactive Next.js tutorial.

### 8. **Testing the Signup/Login Flow**

To ensure everything works as expected, try signing up for a new account using the application. Make sure to verify:
- User creation (via signup)
- Logging in
- Submitting feedback
- Searching for other users

If you run into any issues during setup, double-check your environment variables, and ensure that your PostgreSQL database is accessible.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Follow the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### **Important for Deployment:**
- Make sure to configure the required environment variables in your Vercel project settings (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `POSTGRES_URL`, etc.).
- Use the same values you used in your `.env.local` for production, with the `NEXTAUTH_URL` pointing to your live domain.
