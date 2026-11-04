# Bleez Dashboard

Modern, full-featured administration & management dashboard for the Bleez / AI Travel platform. Built with React 19, TypeScript, Material-UI (MUI), Vite, and Redux Toolkit.

---

## 🚀 Features

- **AI Management & Controls**: Configuration and prompt fine-tuning for travel AI models.
- **API & System Monitoring**: Real-time service health, latency, and request rate tracking.
- **Audit & Security**: Comprehensive audit trails, emergency safety protocols, and watermarking.
- **User & B2B Management**: User accounts, roles, permissions, corporate B2B travel accounts.
- **Bookings & Destinations**: Booking workflows, itinerary management, destination catalogs.
- **Subscriptions & Payments**: Plans, Stripe integration, native IAP support, invoicing.
- **Campaigns & CMS**: Marketing campaigns, banners, landing content, and notifications.
- **Analytics & Reporting**: User telemetry, conversion funnels, expense tracking, and exportable reports.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Components**: [Material-UI (MUI v6)](https://mui.com/) & [Emotion](https://emotion.sh/)
- **Data Tables**: [@mui/x-data-grid](https://mui.com/x/react-data-grid/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + [Redux Persist](https://github.com/rt2zz/redux-persist)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [Notistack](https://notistack.com/)
- **Containerization**: Docker & Docker Compose with Nginx

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/solarch-15/Bleez-Dashboard.git
   cd Bleez-Dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Configure `VITE_API_BASE_URL` to point to your backend API service (default: `http://localhost:4545/api`).

### Development Server

Run the local development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

Build for production:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

### Docker Deployment

To build and run with Docker:
```bash
docker build -t bleez-dashboard .
docker run -p 3000:80 bleez-dashboard
```

Or using Docker Compose:
```bash
docker compose up -d frontend
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 📄 License

Proprietary / All rights reserved.
