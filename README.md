# AgentBank ERP

A modern, multi-tenant web application for agent banking operations management. Built with React, Tailwind CSS, and Supabase.

## 🚀 Features

- **Multi-tenant Architecture** - Complete tenant isolation with bank-level data segregation
- **Daily Operations Management**
  - Deposits and withdrawals tracking
  - Mother account balance management
  - Hand cash monitoring
  - Profit and expense tracking
- **Transaction Logs** - Comprehensive daily transaction history
- **Reporting & Analytics** - Visual dashboards with charts and insights
- **Role-Based Access** - Admin and staff user roles
- **PDF Export** - Generate transaction reports and summaries
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS, shadcn/ui (Radix UI)
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **PDF Generation:** @react-pdf/renderer, jsPDF
- **Deployment:** Vercel

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bank-balance-erp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📦 Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🗄️ Database Setup

The application uses Supabase with PostgreSQL. Database migrations are located in the `supabase/migrations/` directory.

- Migrations run automatically before builds (`prebuild` script)
- Manual migration: `npm run migrate`

## 🔐 Authentication

- Email/password authentication via Supabase Auth
- Row-Level Security (RLS) policies ensure data isolation between banks
- One admin per bank, multiple staff members supported

## 📁 Project Structure

```
├── public/              # Static assets
├── scripts/             # Utility scripts (migrations, etc.)
├── src/
│   ├── components/      # Reusable React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # Layout components
│   │   ├── forms/       # Form components
│   │   └── charts/      # Chart components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   ├── pages/           # Page components
│   ├── routes/          # Route definitions
│   ├── services/        # API services
│   ├── stores/          # Zustand state stores
│   ├── themes/          # Theme configurations
│   └── utils/           # Helper functions
├── supabase/            # Supabase configurations and migrations
└── vite.config.js       # Vite configuration
```

## 🎯 Usage

1. **Register** a new bank account as an admin
2. **Configure** your bank details and settings
3. **Add staff members** if needed
4. **Record transactions** - deposits, withdrawals, expenses
5. **Monitor balances** - mother account, hand cash, profits
6. **Generate reports** - daily, weekly, or custom period reports
7. **Export to PDF** for record-keeping

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

AgentBank ERP Development Team

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Note:** For detailed product specifications and architecture, see [PRD.md](./PRD.md)
