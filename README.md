<h1 align="center">
  <br>
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NodeJS-Dark.svg" alt="Social Media Microservices" width="120">
  <br>
  Social Media Microservices
  <br>
</h1>

<h4 align="center">A highly scalable, event-driven backend for modern social networking platforms.</h4>

<p align="center">
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-18.x-green.svg?style=for-the-badge&logo=node.js" alt="Node.js">
  </a>
  <a href="https://expressjs.com/">
    <img src="https://img.shields.io/badge/Express-5.x-lightgrey.svg?style=for-the-badge&logo=express" alt="Express">
  </a>
  <a href="https://www.mongodb.com/">
    <img src="https://img.shields.io/badge/MongoDB-Latest-47A248.svg?style=for-the-badge&logo=mongodb" alt="MongoDB">
  </a>
  <a href="https://redis.io/">
    <img src="https://img.shields.io/badge/Redis-Latest-DC382D.svg?style=for-the-badge&logo=redis" alt="Redis">
  </a>
  <a href="https://www.rabbitmq.com/">
    <img src="https://img.shields.io/badge/RabbitMQ-Latest-FF6600.svg?style=for-the-badge&logo=rabbitmq" alt="RabbitMQ">
  </a>
  <a href="https://www.docker.com/">
    <img src="https://img.shields.io/badge/Docker-Supported-2496ED.svg?style=for-the-badge&logo=docker" alt="Docker">
  </a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-overview">API</a>
</p>

---

## ✨ Features

Built for high performance and reliability, this architecture is designed to handle millions of interactions with zero bottlenecks.

- **Microservices Architecture**: Decentralized, modular services (Identity, Post, Media, Search) ensuring fault isolation and independent scalability.
- **Event-Driven Pub/Sub**: RabbitMQ integration ensures seamless, asynchronous communication between services. No tight coupling.
- **Blazing Fast API Gateway**: A centralized entry point that securely proxies requests, manages routing, and enforces rate limits.
- **Robust Caching & Rate Limiting**: Redis-powered rate limiting prevents abuse, while caching significantly reduces database load for heavy queries.
- **Secure Authentication**: Stateless JWT validation fortified with Argon2 password hashing.
- **Cloud Media Management**: Direct integration with Cloudinary for fast, optimized image and video processing.
- **Containerized Ready**: Fully Dockerized environments using Docker Compose for 1-click deployments.

---

## 🏗️ Architecture

The system utilizes an API Gateway pattern to route traffic to the appropriate domain service. Services communicate asynchronously using a Message Broker to guarantee eventual consistency and high availability.

```ascii
                      +-------------------+
                      |   Client / Web    |
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      |   API Gateway     |  <-- Rate Limiting (Redis)
                      |   (Port 3000)     |      Auth Middleware
                      +---------+---------+
                                |
        +---------------+-------+-------+---------------+
        |               |               |               |
        v               v               v               v
 +-------------+ +-------------+ +-------------+ +-------------+
 |  Identity   | |    Post     | |   Media     | |   Search    |
 |  Service    | |   Service   | |  Service    | |  Service    |
 +------+------+ +------+------+ +------+------+ +------+------+
        |               |               |               |
        +---------------+-------+-------+---------------+
                                |
                      +---------v---------+
                      |     RabbitMQ      |  <-- Event Bus / Pub-Sub
                      |  Message Broker   |
                      +---------+---------+
                                |
        +---------------+-------+-------+---------------+
        |               |               |               |
        v               v               v               v
   +---------+     +---------+     +---------+     +---------+
   | MongoDB |     | MongoDB |     |Cloudinary     | MongoDB |
   +---------+     +---------+     +---------+     +---------+
```

---

## ⚙️ Tech Stack

| Category | Technologies |
| --- | --- |
| **Core** | Node.js, Express.js (v5) |
| **Databases** | MongoDB (Mongoose) |
| **Cache & In-Memory** | Redis, ioredis |
| **Message Broker** | RabbitMQ (amqplib) |
| **Media Storage** | Cloudinary, Multer |
| **Security** | JWT, Argon2, Helmet, Express Rate Limit |
| **Logging** | Winston |
| **Infrastructure** | Docker, Docker Compose |

---

## 📂 Project Structure

```bash
social-media-microservice/
├── Api-Gateway/          # Centralized entry point and reverse proxy
├── Identity-Service/     # User auth, registration, and profile management
├── post-Service/         # Post creation, timelines, and interaction
├── media-Service/        # Image/video uploads and Cloudinary integration
├── search-service/       # Discoverability and global search indexing
└── docker-compose.yml    # Container orchestration configuration
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) & Docker Compose
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/social-media-microservice.git
cd social-media-microservice
```

### 2. Install dependencies

Since this is a microservices architecture, you need to install dependencies for each service.

```bash
npm install --prefix Api-Gateway
npm install --prefix Identity-Service
npm install --prefix post-Service
npm install --prefix media-Service
npm install --prefix search-service
```

### 3. Environment Variables

Create a `.env` file in **each** service directory based on their respective `.env.example` or the template below:

#### `Identity-Service/.env`
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/identity_db
JWT_SECRET=super_secret_key
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```
*(Repeat and adjust for Post, Media, Search services and the API Gateway)*

### 4. Run via Docker Compose (Recommended)

The easiest way to spin up the entire infrastructure (Redis, RabbitMQ, and all services) is via Docker.

```bash
docker-compose up --build
```
> **Note:** The API Gateway will be available at `http://localhost:3000`.

### 5. Run Locally (Without Docker Services)

If you prefer to run the services individually, ensure Redis and RabbitMQ are running on your machine, then start each service:

```bash
npm run dev --prefix Api-Gateway
npm run dev --prefix Identity-Service
# ... start other services similarly
```

---

## 📡 API Overview

All traffic flows through the **API Gateway (`http://localhost:3000`)**. Here are some common routes:

| Service | Endpoint | Method | Description |
| --- | --- | --- | --- |
| **Identity** | `/api/auth/register` | `POST` | Register a new user |
| **Identity** | `/api/auth/login` | `POST` | Authenticate and receive JWT |
| **Post** | `/api/posts/create` | `POST` | Create a new text/media post |
| **Post** | `/api/posts/feed` | `GET` | Get personalized user feed |
| **Media** | `/api/media/upload` | `POST` | Upload media files |
| **Search** | `/api/search?q=query` | `GET` | Search for users or posts |

---

## 🧠 Key Highlights

What makes this project stand out from standard monolithic tutorials?

- **Fault Tolerance:** If the Search Service crashes, the Post and Identity services continue to function without interruption.
- **Eventual Consistency:** When a user deletes their account in the Identity service, a `USER_DELETED` event is fired to RabbitMQ. The Post and Media services consume this event and clean up associated records asynchronously.
- **Anti-Spam Mechanisms:** Granular rate-limiting using Redis ensures endpoints like `/login` or `/upload` cannot be brute-forced or spammed.
- **Horizontal Scalability:** Heavy workloads like Media processing can be scaled independently of the lightweight API Gateway by adding more `media-service` containers.

---

## 📸 Screenshots / Demo

> *Note: Placeholders for your actual screenshots. Replace the `src` with your actual image paths.*

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=App+Screenshot+1" alt="App Demo 1" width="800"/>
  <br/>
  <img src="https://via.placeholder.com/800x400.png?text=App+Screenshot+2" alt="App Demo 2" width="800"/>
</div>

---

## 🛠️ Future Improvements

- [ ] **Kubernetes Orchestration:** Migrate from Docker Compose to K8s with Helm charts.
- [ ] **CI/CD Pipeline:** GitHub Actions for automated testing and deployment.
- [ ] **GraphQL Federation:** Consolidate REST APIs into a unified GraphQL Supergraph.
- [ ] **WebSockets:** Real-time notifications and live chat using Socket.io.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourusername)

<p align="center">
  <br>
  <i>If you like this project, please give it a ⭐!</i>
</p>
