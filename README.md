# 🚀 Quick Start Node.js GraphQL Backend

This project is a **GraphQL backend** built with **Node.js, TypeScript, Apollo Server, PostgreSQL, Prisma, and Redis**. It follows best practices for authentication, caching, and security.

---

## 📌 Features

- **GraphQL API with Apollo Server**
- **PostgreSQL + Prisma ORM** for database management
- **Authentication with JWT (Access Token + Refresh Token)**
- **Role-based access control (RBAC)**
- **Redis caching for optimized performance**
- **Docker and Docker Compose support**
- **Environment variables validation with Zod**
- **Security best practices (Helmet, CORS, Rate Limiting)**
- **Fully documented with GraphQL Playground**

---

## 📂 Project Structure

📦 quick-start-node-js-graphql
├── 📂 prisma                  # Prisma configuration (DB schema and migrations)
│   ├── 📂 migrations         # Database migrations
│   ├── schema.prisma         # Prisma schema (DB structure)
│
├── 📂 src                     # Main application code
│   ├── 📂 config              # Configuration files (env, database, Redis, logging)
│   │   ├── env.ts            # Environment variables validation (Zod)
│   │   ├── logger.ts         # Winston logger configuration
│   │   ├── prisma.ts         # Prisma database client
│   │   ├── redis.ts          # Redis client connection
│   │
│   ├── 📂 graphql             # GraphQL Schema and Resolvers
│   │   ├── 📂 resolvers       # GraphQL resolvers (business logic for queries/mutations)
│   │   │   ├── userResolvers.ts # Resolvers for User queries and mutations
│   │   ├── 📂 schemas        # GraphQL schemas (types, inputs, enums)
│   │   │   ├── userSchema.ts # GraphQL type definitions for User
│   │   ├── index.ts          # GraphQL schema aggregation (merges all schemas and resolvers)
│   │
│   ├── 📂 middleware         # Express and GraphQL middleware
│   │   ├── auth.ts           # Authentication middleware (JWT validation)
│   │   ├── cache.ts          # Cache middleware (Redis integration)
│   │
│   │
│   ├── 📂 services           # Business logic (separates logic from resolvers)
│   │   ├── authService.ts    # Handles JWT creation, password hashing, authentication
│   │   ├── userServices.ts   # ⚠️ (Empty, move business logic from resolvers)
│   │
│   ├── app.ts                # ⚠️ (Optional) Express app configuration (if separating from `server.ts`)
│   ├── server.ts             # Apollo Server + Express initialization
│
├── .env                      # Environment variables file
├── .env.example              # Example environment variables file
├── .gitignore                # Git ignored files
├── docker-compose.yml        # Docker setup (PostgreSQL, Redis, Backend)
├── Dockerfile                # Dockerfile for backend containerization
├── package.json              # Dependencies and scripts
├── pnpm-lock.yaml            # Dependency lock file
├── README.md                 # Project documentation
├── tsconfig.json             # TypeScript configuration


---

## 🛠️ Installation & Setup

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/your-repo.git
cd quick-start-node-js-graphql
```

### **2️⃣ Install Dependencies**
```sh
pnpm install
```

### **3️⃣ Setup Environment Variables**
Create a **`.env`** file based on **`.env.example`** and configure the values.
```sh
cp .env.example .env
```
Example:
```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your_secret_key
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
REDIS_HOST=localhost
REDIS_PORT=6379
```

### **4️⃣ Start the Backend (with Docker)**
Ensure Docker is installed and running, then execute:
```sh
docker-compose up -d
```
This will start **PostgreSQL** and **Redis** inside Docker containers.

### **5️⃣ Run Database Migrations**
```sh
pnpm prisma migrate dev
```

### **6️⃣ Start the Server**
```sh
pnpm dev
```
🚀 **API is running at:** `http://localhost:4000/graphql`

---

## 🔐 Authentication (JWT)

### **Access Token & Refresh Token Workflow**
1. User logs in and receives an **Access Token** (short-lived) and a **Refresh Token** (stored in Redis).
2. When the Access Token expires, the Refresh Token can be used to generate a new one.
3. Users can logout, which removes the Refresh Token from Redis.

### **Example Queries & Mutations**

#### **🔹 Register a User**
```graphql
mutation {
  createUser(name: "John Doe", email: "john@example.com", password: "123456", role: ADMIN) {
    id
    name
    email
  }
}
```

#### **🔹 Login & Get Tokens**
```graphql
mutation {
  login(email: "john@example.com", password: "123456") {
    accessToken
    refreshToken
  }
}
```

#### **🔹 Access a Protected Route**
_(Requires `Authorization` header: `Bearer YOUR_ACCESS_TOKEN`)_
```graphql
query {
  getAllUsers {
    id
    name
    email
  }
}
```

#### **🔹 Refresh Access Token**
```graphql
mutation {
  refreshToken(refreshToken: "YOUR_REFRESH_TOKEN") {
    accessToken
    refreshToken
  }
}
```

#### **🔹 Logout (Invalidate Refresh Token)**
```graphql
mutation {
  logout {
    message
  }
}
```

---

## ⚡ Redis Caching

### **🔹 Cached Queries Example**
`getAllUsers` is cached in Redis for **120 seconds**.
```typescript
export const userResolver = {
  Query: {
    getAllUsers: async () => {
      return cacheMiddleware("getAllUsers", async () => {
        return await prisma.user.findMany();
      }, 120);
    },
  },
};
```

### **🔹 Verify Cache in Redis**
```sh
redis-cli
keys *
```
If `getAllUsers` is cached, it will be displayed.

### **🔹 Clear Cache on Data Change**
When a new user is created, the cache is cleared to ensure fresh data.
```typescript
await redis.del("getAllUsers");
```

---

## 🛡️ Security Best Practices

### **Helmet (Security Headers)**
```typescript
import helmet from "helmet";
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", "data:", "apollo-server-landing-page.cdn.apollographql.com"],
      scriptSrc: ["'self'", "https: 'unsafe-inline'"],
      frameSrc: ["'self'", "sandbox.embed.apollographql.com"],
    },
  },
}));
```

### **Rate Limiting**
```typescript
import rateLimit from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});
app.use(limiter);
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

For questions or feedback, reach out via **GitHub Issues** or email **your-email@example.com**.

---

🚀 **Enjoy building with GraphQL, Prisma, and Redis!**

