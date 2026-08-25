# Ezay Cart — E-commerce Backend API

Ezay Cart is a RESTful backend API for an e-commerce application, built with **NestJS, TypeScript, PostgreSQL, and TypeORM**.

The project focuses on building a structured and secure backend with authentication, authorization, token management, user management, product management, reviews, file uploads, email verification, and password recovery.

## Features

### Authentication & Security

- User registration and login
- JWT-based authentication
- Short-lived access tokens
- Refresh token rotation
- Secure refresh token stored in an HTTP-only cookie
- Refresh token revocation on logout
- Email verification
- Resend email verification
- Forgot password flow
- Password reset token verification
- Password reset
- Change authenticated user's password
- Force password reset by administrators
- Role-based authorization (`user`, `admin`)
- Password hashing with `bcrypt`

### Users

- Get authenticated user
- Update authenticated user
- Get user by ID
- Get paginated users
- Create users
- Update users
- Delete users
- Role management

### Products

- Create products
- Get products
- Get product by ID
- Update products
- Delete products
- Search products by name
- Filter products by owner
- Filter products by price range
- Pagination
- Sorting by name, price, or creation date

### Reviews

- Create product reviews
- Get reviews for a product
- Get all reviews
- Get review by ID
- Update reviews
- Delete reviews

### File Uploads

The API provides upload signatures for client-side uploads:

- Product image uploads
- Profile image uploads

Uploads are handled through **Cloudinary**, allowing files to be uploaded directly from the client without sending the file through the application server.

### Email

The application supports email-based authentication workflows including:

- Email verification
- Verification email resend
- Password reset emails
- Forced password reset emails

Email delivery is implemented using **Nodemailer** and the NestJS mailer module.

---

## Tech Stack

| Category          | Technology        |
| ----------------- | ----------------- |
| Runtime           | Node.js           |
| Framework         | NestJS            |
| Language          | TypeScript        |
| Database          | PostgreSQL        |
| ORM               | TypeORM           |
| Authentication    | JWT               |
| Password Hashing  | bcrypt            |
| Validation        | class-validator   |
| Transformation    | class-transformer |
| Email             | Nodemailer        |
| File Storage      | Cloudinary        |
| API Documentation | Swagger / OpenAPI |
| Testing           | Jest / Supertest  |
| Code Quality      | ESLint / Prettier |

---

## Architecture

The application follows NestJS's modular architecture.

```text
src/
├── auth/
│   ├── controllers/
│   ├── services/
│   ├── guards/
│   ├── strategies/
│   └── dto/
│
├── users/
│   ├── controllers/
│   ├── services/
│   ├── entities/
│   └── dto/
│
├── products/
│   ├── controllers/
│   ├── services/
│   ├── entities/
│   └── dto/
│
├── reviews/
│   ├── controllers/
│   ├── services/
│   ├── entities/
│   └── dto/
│
├── uploads/
│
├── database/
│   ├── migrations/
│   └── data-source.ts
│
└── main.ts
```

The exact directory structure may evolve as the project grows.

---

## Authentication Flow

The authentication system uses an **Access Token + Refresh Token** architecture.

```text
Client
  │
  │ Login
  ▼
Auth API
  │
  ├── Access Token
  │
  └── Refresh Token
          │
          ▼
     HTTP-only Cookie
```

The access token is used to authenticate protected API requests.

The refresh token is stored in an **HTTP-only cookie** and is used to obtain a new access token when the access token expires.

Refresh tokens are rotated and can be revoked during logout.

### Authentication Endpoints

| Method | Endpoint                           | Description                      |
| ------ | ---------------------------------- | -------------------------------- |
| POST   | `/v1/api/auth/register`            | Register a new user              |
| POST   | `/v1/api/auth/login`               | Authenticate a user              |
| POST   | `/v1/api/auth/refresh`             | Refresh the access token         |
| POST   | `/v1/api/auth/logout`              | Revoke the current refresh token |
| POST   | `/v1/api/auth/resend-verification` | Resend verification email        |
| POST   | `/v1/api/auth/verify-email`        | Verify email address             |
| POST   | `/v1/api/auth/forgot-password`     | Request password reset           |
| POST   | `/v1/api/auth/verify-reset-token`  | Verify reset token               |
| POST   | `/v1/api/auth/reset-password`      | Reset password                   |
| POST   | `/v1/api/auth/change-password`     | Change current password          |

---

## API Overview

The API is versioned under:

```text
/v1/api
```

### Users

```text
GET     /v1/api/users
POST    /v1/api/users

GET     /v1/api/users/me
PATCH   /v1/api/users/me

GET     /v1/api/users/:id
PATCH   /v1/api/users/:id
DELETE  /v1/api/users/:id

POST    /v1/api/users/:id/force-password-reset
```

### Products

```text
GET     /v1/api/products
POST    /v1/api/products

GET     /v1/api/products/:id
PATCH   /v1/api/products/:id
DELETE  /v1/api/products/:id
```

Product listing supports:

- Name search
- Owner filtering
- Minimum price
- Maximum price
- Pagination
- Sorting
- Sort order

Example:

```text
GET /v1/api/products?name=phone&minPrice=1000&maxPrice=50000&page=1&limit=10&sortBy=price&sortOrder=ASC
```

### Reviews

```text
GET     /v1/api/products/:productId/reviews
POST    /v1/api/products/:productId/reviews

GET     /v1/api/reviews
GET     /v1/api/reviews/:id
PATCH   /v1/api/reviews/:id
DELETE  /v1/api/reviews/:id
```

### Uploads

```text
POST    /v1/api/uploads/product-signatures
POST    /v1/api/uploads/profile-signature
```

---

## API Documentation

The API is documented using **Swagger / OpenAPI**.

When running the development server, the Swagger documentation is available at:

```text
http://localhost:3001/api
```

> The exact Swagger path depends on the application's Swagger configuration.

The OpenAPI specification documents:

- Authentication endpoints
- Request DTOs
- Response DTOs
- Protected endpoints
- JWT Bearer authentication
- Query parameters
- Pagination
- Product filtering
- User management

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL

You will also need accounts/configuration for:

- Email provider / SMTP
- Cloudinary

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd ezay-cart
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root.

Example:

```env
# Application
PORT=3001
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=ezay_cart

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=15d

# Email
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_email
MAIL_PASSWORD=your_password
MAIL_FROM=your_email

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> Never commit real secrets or credentials to the repository.

### Database

Create the PostgreSQL database:

```sql
CREATE DATABASE ezay_cart;
```

Then run the migrations:

```bash
npm run migration:run
```

To check migration status:

```bash
npm run migration:show
```

To revert the latest migration:

```bash
npm run migration:revert
```

---

## Running the Application

### Development

```bash
npm run start:dev
```

### Production

Build the application:

```bash
npm run build
```

Then start it:

```bash
npm run start:prod
```

The API will be available at:

```text
http://localhost:3001
```

---

## Database Migrations

This project uses **TypeORM migrations** instead of relying on automatic schema synchronization.

Generate a migration:

```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

Create an empty migration:

```bash
npm run migration:create -- src/database/migrations/MigrationName
```

Run migrations:

```bash
npm run migration:run
```

Revert the latest migration:

```bash
npm run migration:revert
```

---

## Testing

Run the test suite:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate a coverage report:

```bash
npm run test:cov
```

Run end-to-end tests:

```bash
npm run test:e2e
```

---

## Code Quality

Format the source code:

```bash
npm run format
```

Run ESLint:

```bash
npm run lint
```

---

## Security Considerations

The project applies several security practices around authentication and sensitive data:

- Passwords are hashed using `bcrypt`
- Access tokens are short-lived
- Refresh tokens are stored in HTTP-only cookies
- Refresh tokens are rotated
- Refresh tokens can be revoked
- Sensitive token values are not stored directly when token hashing is used
- Authentication-protected endpoints require JWT authentication
- Role-based authorization separates administrative operations
- Environment variables are used for secrets and credentials
- Email verification is required as part of the account verification flow

The security model is designed around **defense in depth**, rather than relying on a single security mechanism.

---

## API Versioning

All application endpoints are exposed under the `/v1/api` prefix.

Example:

```text
/v1/api/auth/login
/v1/api/users/me
/v1/api/products
```

Using an explicit API version makes it possible to introduce future breaking changes through a new API version without immediately breaking existing clients.

---

## Project Status

This project is under active development.

The current backend focuses on establishing a solid foundation for:

- Authentication
- Authorization
- User management
- Product management
- Reviews
- File uploads
- Email workflows
- Database migrations
- API documentation
- Automated testing

Additional e-commerce functionality can be added as the project evolves.

---

## License

This project is currently marked as **UNLICENSED** and is intended for personal/educational and portfolio purposes.
