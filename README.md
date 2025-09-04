# Coupon Calendar - Bond Portfolio Management Service

A comprehensive bond portfolio management application focused on the Russian market (MOEX).

## 🌟 Key Features

### 📅 **Interactive Calendar System**

* **Visual Coupon Calendar**: View all coupon payments in an intuitive monthly calendar format
* **Holiday-Aware Payment Dates**: Automatic adjustment for weekends and Russian holidays
* **Click-to-View Details**: Click any date to see detailed coupon and amortization information
* **Multi-Currency Support**: Display payments in different currency
* **Monthly Payment Summaries**: See total expected payments by currency for each month

### 💼 **Portfolio Management**

* **Multiple Portfolio Support**: Create, edit, and manage unlimited portfolios
* **Portfolio Customization**: Color-coded portfolios with custom names
* **Real-time Portfolio Analytics**:
  + Total purchase value vs current market value
  + Profit/loss tracking with percentage calculations
  + Average current yield calculations
  + Animated value transitions with GSAP
* **Bond Management**: Add, remove, and edit bond quantities and purchase prices
* **Local & Server Storage**: local for unauthorized users and cloud-synced portfolios for authorized

### 📊 **Advanced Bond Data Table**

* **Virtualized Scrolling**: Handle thousands of bonds with smooth performance
* **Comprehensive Bond Information**:
  + Current price and face value
  + Coupon amount and payment frequency
  + Yield to maturity (YTM) and current yield
  + Duration and maturity dates
  + Accumulated coupon income (ACI)
  + Effective yield calculations
* **Advanced Filtering & Search**: Search by bond name, ISIN, or SECID
* **Sortable Columns**: Sort by any metric for easy analysis
* **Tooltip Explanations**: Hover for detailed explanations of financial terms

### 🔍 **Bond Discovery & Search**

* **Complete MOEX Database**: Access all bonds trading on Moscow Exchange
* **Smart Search**: Real-time search with virtualized dropdown
* **Quick Add System**: Add bonds to portfolio with one click

### 🔐 **Authentication & Security**

* **Multiple Login Options**:
  + Email/password registration and login
  + Google OAuth integration
  + Yandex OAuth integration
* **Secure Session Management**: JWT-based authentication with NextAuth.js
* **Rate Limiting**: Protection against abuse with Upstash Redis
* **Input Validation**: Zod schema validation for all user inputs

### 🎨 **User Experience**

* **Dark/Light Theme**: Toggle between themes with system preference detection
* **Responsive Design**: Mobile-first approach with adaptive layouts
* **Loading States**: Skeleton screens and loading indicators
* **Toast Notifications**: Success, error, and loading notifications
* **Smooth Animations**: GSAP-powered transitions

### 🛠 **Technical Features**

* **Server-Side Rendering**: Next.js 15 with App Router
* **Type Safety**: Full TypeScript implementation
* **Database Integration**: Prisma ORM with MongoDB
* **Code Quality**: ESLint, Prettier, and Husky pre-commit hooks

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* MongoDB database
* Redis instance (e.g., Upstash)

### Installation

1. **Clone the repository**

```bash
   git clone https://github.com/BrokenDetector/Coupon-calendar.git
   cd Coupon-calendar
   ```

2. **Install dependencies**

```bash
   npm install
   ```

3. **Environment Setup**

```bash
   cp .env.example .env
   ```

   Configure your environment variables:

```env
   # Database
   DATABASE_URL="mongodb+srv://..."

   # Redis
   UPSTASH_REDIS_URL="..."
   UPSTASH_REDIS_TOKEN="..."

   # Authentication
   NEXTAUTH_SECRET="..."
   NEXTAUTH_URL="..."
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   YANDEX_CLIENT_ID="..."
   YANDEX_CLIENT_SECRET="..."

   # Analytics (optional)
   GA_MEASUREMENT_ID="..."
   ```

4. **Database Setup**

```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**

```bash
   npm run dev
   ```

   App runs at `http://localhost:3000` .

## 🏗 Architecture

### Frontend

* **Next.js 15** with App Router for server-side rendering
* **React 18**
* **React Hook Form, Zod** for forms
* **TypeScript** for type safety
* **Tailwind CSS** for styling
* **Shadcn/ui** for component library
* **TanStack Table** for data tables with virtualization
* **GSAP, formkit/auto-animate** for animations

### Backend

* **Next.js** for server actions
* **Prisma ORM** for database operations
* **NextAuth.js** for authentication
* **Upstash Redis** for rate limiting

### Data Sources

* **MOEX API** for bond market data
* **Central Bank of Russia** for currency exchange rates
* **Nager Date API** for Russian holidays
