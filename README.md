# InnoCivic 🌍📊

*A civic data hub for Russia — centralizing, enriching, and sharing public datasets.*

## 🚀 Overview

InnoCivic is a web platform that centralizes and enriches both official and user-contributed datasets to support **students, researchers, journalists, and civic tech enthusiasts**.

We make public data **easy to find, visualize, and analyze**, solving the challenge of fragmented or outdated information across Russia.

## ✨ Features

- **Centralized Access** - Official and community-contributed datasets
- **Smart Search** - Advanced search and discovery across multiple domains
- **Interactive Visualizations** - Charts, maps, and timelines
- **User Contributions** - Versioning and attribution system
- **AI-Powered** - Auto-tagging and dataset summarization
- **Quality Control** - Anomaly detection and smart visualization suggestions
- **Mobile-First** - Fully responsive design optimized for all devices

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Leaflet** for interactive maps
- **React Router** for navigation
- **React Hook Form + Zod** for form management
- **TanStack Query** for server state
- **Zustand** for global state

### Component Architecture
- **35 Shared Components** - Layout, navigation, forms, feedback
- **50+ Feature Components** - Dataset, visualization, search, user features
- **15 Page Components** - Home, catalog, detail, dashboard pages
- **Comprehensive TypeScript** - Full type safety throughout

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/innocivic.git
   cd innocivic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/          # Shared/reusable components (35)
│   ├── layout/         # AppLayout, Navbar, Sidebar, Footer
│   ├── navigation/     # Breadcrumbs, Tabs, Pagination
│   ├── data-display/   # DataCard, DataGrid, Badge, Chip
│   ├── forms/          # Input, Select, Button, FileUpload
│   ├── feedback/       # Alert, Toast, Modal, Loader
│   └── utility/        # Tooltip, Dropdown, EmptyState
│
├── features/           # Feature-specific components (50+)
│   ├── datasets/       # Dataset management components
│   ├── visualizations/ # Chart and map components
│   ├── search/         # Search and filter components
│   ├── user/           # User dashboard components
│   └── upload/         # Dataset upload components
│
├── pages/              # Page-level components (15)
│   ├── HomePage.tsx
│   ├── DatasetCatalogPage.tsx
│   ├── DatasetDetailPage.tsx
│   ├── UserDashboardPage.tsx
│   └── LoginPage.tsx
│
├── types/              # TypeScript type definitions
├── router/             # React Router configuration
└── services/           # API services and utilities
```

## 🎯 Development Phases

### ✅ Phase 1: Core Infrastructure
- AppLayout, Navbar, Footer
- Input, Select, Button components
- DataCard, DataGrid
- Toast, Loader, ErrorBoundary

### ✅ Phase 2: Dataset Features
- DatasetCard, DatasetList, DatasetDetail
- SearchInput, FilterSidebar
- HomePage, DatasetCatalogPage

### ✅ Phase 3: Visualizations
- BarChart, LineChart, PieChart
- MapVisualization with Leaflet
- ChartBuilder interface

### ✅ Phase 4: User Features
- UserDashboardPage, LoginPage
- UserStats, NotificationFeed
- UploadWizard components

### ✅ Phase 5: Admin & Polish
- AdminDashboardPage
- Error boundaries and accessibility
- Performance optimizations

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Gray Scale**: 50-900

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Sizes**: xs (12px) to xl (20px)

### Components
- **Consistent spacing** using Tailwind's spacing scale
- **Accessible** with proper ARIA labels and keyboard navigation
- **Responsive** mobile-first design
- **Composable** for maximum reusability

## 🔧 Configuration

### Tailwind CSS
Configuration in `tailwind.config.js` with custom color palette and typography.

### TypeScript
Strict mode enabled with comprehensive type definitions in `src/types/`.

### ESLint
Configured for React and TypeScript with accessibility rules.

## 📱 Responsive Design

- **Mobile First** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly** interface elements
- **Optimized** for all screen sizes

## ♿ Accessibility

- **WCAG 2.1 AA** compliant
- **Keyboard navigation** support
- **Screen reader** friendly
- **High contrast** ratios
- **Focus management**

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Russia's civic tech community
- Inspired by open data initiatives worldwide
- Powered by modern web technologies

---

**InnoCivic** - Making civic data accessible for everyone 🇷🇺