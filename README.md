# SimpleShop

<img width="1793" alt="Screenshot at Apr 24 20-34-42" src="https://github.com/user-attachments/assets/38a77c31-825c-4a43-ae40-3b329775323b" />
Recording: https://drive.google.com/drive/folders/1kzECA83DfpiJpcL6AmbAVxD4_Oos5UwA?usp=sharing


## Project Overview
A full-stack e-commerce application built with Next.js 15.3 and Express.js, featuring product browsing, shopping cart functionality, and order processing. The application uses Supabase for storage and Resend for email notifications.

## Prerequisites
- Docker
- Docker Compose
- Node.js (v18+)
- MySQL
- Supabase account (for image storage)
- Resend account (for email notifications)

## Getting Started

### Running the Application
Clone the repository:
```bash
git clone https://github.com/Rezaramdhanisti/simple-online-shop.git
cd simple-online-shop
```

#### Using Docker Compose
Build and start the application:
```bash
npm run start:dev
```
or
```bash
docker-compose up --build
```

Access the application:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5001`
- MySQL: `localhost:3306`

#### Stopping the Application
```bash
npm run stop
```
or
```bash
docker-compose down
```

#### Development
Install dependencies:
```bash
npm run install:all
```

Start the application in development mode:
```bash
npm run dev
```

For a clean restart (prunes Docker system and rebuilds without cache):
```bash
npm run restart:clean
```

### Backend (Node.js)
- Located in `./backend`
- Uses Express.js framework
- MySQL for database (via Sequelize ORM)
- JWT for authentication
- Runs on port `5000` (mapped to `5001` in Docker)

### Frontend (Next.js)
- Located in `./frontend`
- Built with Next.js 15.3.1
- React 19
- Tailwind CSS for styling
- Runs on port `3000`

## Technologies
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Frontend**: Next.js 15.3.1, React 19, Tailwind CSS 4
- **Database**: MySQL 8.0
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT, bcryptjs
- **External Services**: 
  - Supabase (for image storage)
  - Resend (for email notifications)
- **Development Tools**: TypeScript 5, ESLint 9, Next.js Turbopack

## Deployment 
- **Frontend**: Vercel https://simple-online-shop-weld.vercel.app/shop/catalog
- **Backend**: Ngrok

### Important Deployment Notes
When deploying to Vercel, make sure to:
1. Set the `NEXT_PUBLIC_API_BASE_URL` environment variable to point to your deployed backend API
2. Configure Supabase and Resend API keys in environment variables
3. Ensure CORS is properly configured on your backend to accept requests from your Vercel domain

## Features
### Merchant Journey:
- Login Page
- Add Product (Title, SKU, Description, Qty)
- Upload Multiple Product Images (One-to-Many Relationship)
- List Products

### User Journey:
- View Product Catalog
- Add to Cart / Remove Product / Edit Quantity
- Checkout Page (With Email Notification to User)
