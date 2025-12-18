# 🕌 Teqwa Frontend

React + Vite frontend for the Teqwa mosque management platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd teqwa-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env  # Copy example file
   # Or for development:
   cp .env.development.example .env
   # Edit .env with your backend API URL (VITE_API_URL)
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 🐳 Docker Development

### Using Docker Compose

```bash
docker compose up --build
```

This will start:
- React development server (port 5173)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000
```

## 🏗️ Project Structure

```
teqwa-frontend/
├── src/
│   ├── components/      # React components
│   │   ├── auth/        # Authentication components
│   │   ├── dashboard/   # Dashboard components
│   │   ├── layout/      # Layout components
│   │   ├── ui/          # UI components
│   │   └── widgets/     # Widget components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── config/          # Configuration files
│   └── assets/          # Static assets
├── public/              # Public assets
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` directory with optimized production files.

### Deploy Static Files

The `dist/` directory can be deployed to:
- **Static hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: AWS CloudFront, Cloudflare
- **S3**: AWS S3 with CloudFront
- **Nginx**: Traditional web server

### Environment Variables for Production

```env
VITE_API_URL=https://api.yourdomain.com
```

**Important**: Environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

## 🎨 Features

- **React 18** with functional components and hooks
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **React Router** for client-side routing
- **Framer Motion** for animations
- **React Context** for state management
- **Responsive design** for all devices
- **Dark/Light mode** theme switching
- **Multi-language support** (Arabic/English)

## 📱 Pages

- **Home** - Landing page with prayer times widget
- **Events** - Event listings and details
- **Donations** - Donation causes and payment
- **News** - News and announcements
- **Prayer Times** - Prayer times calendar and Qibla direction
- **Futsal** - Court booking system
- **Education** - Educational services
- **Dashboard** - Role-based dashboards (Admin, Staff, Teacher, Student, Parent, User)
- **Profile** - User profile management

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes
- Email verification
- Password reset

## 🔗 API Integration

The frontend communicates with the backend API. Configure the API URL via `VITE_API_URL` environment variable.

### API Service

All API calls are centralized in `src/lib/apiService.js` and `src/lib/dataService.js`.

## 🎯 Key Technologies

- **React 18**
- **Vite 5**
- **Tailwind CSS 3**
- **React Router 6**
- **Framer Motion**
- **Axios**
- **date-fns**
- **react-icons**

## 📦 Build Output

The production build includes:
- Optimized JavaScript bundles
- Minified CSS
- Optimized images
- Source maps (optional)

## 🔗 Related Repositories

- **Backend**: [teqwa-backend](https://github.com/your-org/teqwa-backend)

## 📄 License

MIT License

## 🤝 Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.
