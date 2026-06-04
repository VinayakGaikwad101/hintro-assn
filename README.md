# Hintro Meeting Intelligence Service

An AI-powered backend service designed to capture insights, track actionable elements, and manage follow-ups from meeting transcripts.

## 🚀 Live Environment

- **Production API URL:** https://hintro-assn.onrender.com
- **Interactive API Documentation (Swagger):** https://hintro-assn.onrender.com/api-docs
- **Evaluation Status Endpoint:** https://hintro-assn.onrender.com/api/evaluation

## ⚙️ Setup Instructions & Local Execution

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database (Neon recommended)

### 1. Installation

Clone the repository and install dependencies:
\`\`\`bash
git clone https://github.com/VinayakGaikwad101/hintro-assn.git
cd hintro-assn
npm install
\`\`\`

### 2. Environment Variables

Create a \`.env\` file in the root directory and add the following keys. Do NOT commit this file.
\`\`\`env
PORT=3000
DATABASE_URL="postgresql://user:password@host/dbname"
JWT_SECRET="your_super_secret_jwt_string"
GEMINI_API_KEY="your_google_gemini_api_key"
DISCORD_WEBHOOK_URL="your_discord_webhook_url"
\`\`\`

### 3. Local Execution Steps

To run the server in development mode (with hot reloading via `tsx`):
\`\`\`bash
npm run dev
\`\`\`
The server will start at \`http://localhost:3000\`.

## ☁️ Deployment Instructions

This application is configured to be deployed as a persistent Web Service (e.g., on Render or Railway).

1. Connect your GitHub repository to your hosting provider.
2. Set the build command to: \`npm install && npm run build\`
3. Set the start command to: \`npm start\`
4. Inject all environment variables listed above into the provider's dashboard.

## 📖 API Usage Examples

**1. Create a Meeting (POST `/api/meetings`)**
\`\`\`json
{
"title": "Sprint Planning",
"participants": ["alice@example.com", "bob@example.com"],
"meetingDate": "2026-05-20T10:00:00Z",
"transcript": [
{ "timestamp": "00:10", "speaker": "John", "text": "We should launch next Friday." },
{ "timestamp": "00:20", "speaker": "Alice", "text": "I will prepare release notes." }
]
}
\`\`\`

**2. Generate AI Analysis (POST `/api/meetings/:id/analyze`)**
_Returns an AI-generated summary and action items mapped strictly to transcript timestamps._
