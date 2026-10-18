# 📚 BookLeaf Author Support & Communication Portal

An AI-powered full-stack support ticketing platform built for BookLeaf Publishing to streamline author communication, organize support requests, and assist the operations team with intelligent ticket classification, priority assessment, and response drafting.

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture & Design Decisions](#️-architecture--design-decisions)
- [AI Integration](#-ai-integration)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Demo Access](#-demo-access)
- [Known Limitations & Future Improvements](#-known-limitations--future-improvements)

---

## 🎯 Overview

BookLeaf Author Support & Communication Portal provides two role-based interfaces:

- **Author Portal:** Enables authors to access their book information, submit support tickets, and view ticket updates and responses.
- **Admin Portal:** Enables the operations team to manage support tickets, review AI-generated classifications and priorities, and prepare responses for authors.

The application combines REST APIs, MongoDB persistence, JWT authentication, and LLM-powered assistance to improve support workflow efficiency.

## ✨ Features

### 👤 Author Portal

- **Authentication:** Email and password-based login using JWT.
- **My Books:** View book information and associated publishing and royalty details.
- **Submit Support Query:** Create support tickets linked to a specific book or a general account-level query.
- **Ticket Tracking:** View submitted tickets, their statuses, and associated conversations.
- **Ticket Replies:** Access responses from the support team.
- **Attachment Support:** Accept ticket attachment information as implemented by the current backend.

### 🛠️ Admin Portal

- **Ticket Management:** Access and manage incoming author support tickets.
- **Ticket Classification:** Automatically classify new tickets into predefined support categories using AI, with a fallback when AI processing fails.
- **Priority Assessment:** Assign an initial priority to help identify tickets requiring attention.
- **AI-Assisted Responses:** Generate draft replies using the ticket query and BookLeaf policy context.
- **Manual Overrides:** Allow the support team to review and correct AI-generated information.
- **Ticket Status Updates:** Manage the ticket lifecycle and support workflow.
- **Author-Specific Access Control:** Protect author data through role-based authorization.

### 🧠 AI-Assisted Ticket Processing

The application is designed to assist support staff with:

- Royalty & Payments
- ISBN & Metadata Issues
- Printing & Quality
- Distribution & Availability
- Book Status & Production Updates
- General Inquiry

AI output is intended to assist the admin team; generated classifications and drafts should be reviewed before being used in author communication.

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- TypeScript
- SASS/SCSS
- Axios
- React Router DOM

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)

### AI Integration

- Groq API
- OpenAI-compatible SDK
- `openai/gpt-oss-20b` model configuration

### Supporting Tools

- Postman for API testing
- Git and GitHub for version control
- MongoDB Atlas for database hosting
- UploadThing for cloud file uploads
- Multer for file handling

## 🏗️ Architecture & Design Decisions

### 1. Frontend and Backend Separation

The frontend communicates with the Express backend through REST APIs. This separation keeps presentation, business logic, authentication, database operations, and AI processing organized independently.

### 2. MongoDB and Mongoose

MongoDB stores application entities such as users, books, tickets, and ticket messages. Mongoose provides schemas, model definitions, and database query operations.

### 3. JWT Authentication and Role-Based Access Control

JWT-based authentication identifies the logged-in user. Protected backend routes enforce role-specific permissions.

Authors should only be able to access their own books and tickets, while authorized administrators can manage tickets across authors.

### 4. Separate Ticket and Message Models

Ticket information and ticket conversation messages are maintained separately. This supports a cleaner data model and avoids repeatedly embedding an expanding conversation inside each ticket document.

### 5. AI-Assisted Processing with Fallbacks

AI processing is separated from the main ticket workflow. If classification fails, ticket creation should still succeed with fallback values, allowing the support team to continue working manually.

### 6. Environment-Based Configuration

Database credentials, JWT secrets, and AI API keys are configured through environment variables rather than hardcoded in application source files.

## 🧠 AI Integration

### Model Configuration

The backend uses the Groq API with an OpenAI-compatible model configuration:

`openai/gpt-oss-20b`

The model is selected to support responsive AI-assisted processing for the support workflow.

### Prompt Strategy

The AI workflow uses the ticket's subject and description along with relevant BookLeaf policy information.

The policy context covers areas such as:

- Royalty calculation and payout timelines
- ISBN assignment and metadata issues
- Printing defects and reprints
- Distribution availability
- Book production stages
- Professional and empathetic author communication

Prompts are intended to encourage specific, policy-aligned answers rather than generic responses.

### Classification and Priority

When a ticket is created, the backend attempts to classify the query and determine an initial priority. If AI processing fails, fallback values allow the ticket workflow to continue.

### Response Draft Generation

The admin can request an AI-generated response draft based on the ticket query and the relevant knowledge-base context. The draft is intended for admin review and editing before being sent to the author.

### Error Handling and Cost Awareness

- AI failures should not prevent ticket creation.
- The admin should retain the ability to classify tickets and compose responses manually.
- Only relevant query information and policy context should be sent to the model where possible.
- Draft generation should occur when required by the admin workflow instead of unnecessarily repeating AI requests.

## 🔌 API Documentation

The backend exposes REST API endpoints for authentication, author ticket ,books operations, and administration.

### Authentication Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Retrieve the authenticated user's profile |

### Author Ticket Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/tickets` | Create a support ticket |
| GET | `/api/tickets/my-tickets` | Retrieve the author's tickets |
| GET | `/api/tickets/:id` | Retrieve ticket details |

### Admin Ticket Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/tickets` | Retrieve and filter tickets |
| PATCH | `/api/admin/tickets/:id` | Update ticket information |

###  Author Book Routes

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/get-books` | Required | Retrieve books associated with the authenticated author. |
| GET | `/api/get-book/:bookId` | Required | Retrieve details of a specific book using its book ID. |

Both endpoints use the `authenticate` middleware to protect access to book data.


### Postman Collection

A Postman collection can be used to test the authentication, author ticket, and admin workflows.

**Collection file:** `BookLeaf.postman_collection.json`

Ensure this file exists in the repository before linking it here.

## 📁 Project Structure

```text
bookleaf-support-portal/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── ...
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       │   └── aiService.ts
│       │   └── uploadthing.ts
│       └── server.ts
├── BookLeaf.postman_collection.json
└── README.md
```

This is a representative structure. Adjust directory names to match the actual repository.

## 💻 Setup & Installation

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB Atlas URI or a local MongoDB instance
- Groq API key for AI functionality
- Uploadthing key for file storing

### 1. Clone the Repository

```bash
git clone https://github.com/pranitaaeer/bookleaf-support-portal.git
cd bookleaf-support-portal
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure the required variables.

Start the development server using the script defined in `backend/package.json`. If the script is named `dev`, run:

```bash
npm run dev
```

### 3. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory.

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend using the script defined in `frontend/package.json`. If the script is named `dev`, run:

```bash
npm run dev
```

Open the local URL displayed by Vite in the terminal.

## 🔐 Environment Variables

### Backend `.env`

```env
MONGO_URI=your_mongodb_connection_string
DB_NAME=your_database_name
JWT_SECRET=your_long_random_secret
GROQ_API_KEY=your_groq_api_key
LLM_MODEL=openai/gpt-oss-20b
SEED_AUTHOR_PASSWORD=your_seed_data_password
ADMIN_SETUP_KEY=your_admin_setup_key
UPLOADTHING_TOKEN=your_admin_setup_key
VITE_FRONTEND_URL=http://localhost:5173

```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## 🌐 Demo Access

- **Live Application:** `<ADD_DEPLOYED_APPLICATION_URL>`


### Test Credentials

Add verified test accounts for both roles here after confirming that they work on the deployed application.

| Role | Email | Password |
|---|---|---|
| Author | `aeerpranita@gmail.com` | `12345678` |
| Admin | `admin@example.com` | `admin@123` |


## ⚠️ Known Limitations & Future Improvements

Potential improvements include:

- Adding comprehensive automated tests for API routes and authorization.
- Introducing structured request validation and more detailed API documentation.
- Improving real-time ticket updates where the current implementation relies on polling.
- Adding AI output validation, retry policies, and monitoring.
- Improving ticket assignment, audit logs, and administrative analytics.
- Adding production-grade rate limiting, logging, and observability.
- Improving deployment security and secret management.


## 📌 Project Notes

This project was developed as a full-stack technical assignment for BookLeaf Publishing. The implementation focuses on author support workflows, role-based access, maintainable backend architecture, and practical AI assistance for ticket handling.

The repository is intended to remain private in accordance with the assignment's confidentiality requirements.
