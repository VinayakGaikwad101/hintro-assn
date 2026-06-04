# Architecture & Technical Decisions

This document outlines the system design decisions, trade-offs, and alternatives considered during the development of the Meeting Intelligence Service.

## 1. Database Choice: PostgreSQL (via Neon)

- **Why it was chosen:** The data relationships in this project (Meetings -> Action Items -> Users) are strictly relational. PostgreSQL provides strong data integrity and powerful querying (crucial for filtering action items). Neon was chosen for its serverless, zero-config deployment.
- **Alternatives considered:** MongoDB.
- **Trade-offs:** While MongoDB allows for faster initial prototyping with unstructured data, a NoSQL approach could lead to orphaned action items or complex aggregation pipelines when querying overdue tasks across multiple meetings.

## 2. Authentication Strategy: JWT (JSON Web Tokens)

- **Why it was chosen:** JWT provides stateless authentication, making the API horizontally scalable. Since the server does not need to store session data in memory or a database, it reduces latency and infrastructure overhead.
- **Alternatives considered:** Session-based authentication (Cookies + Redis).
- **Trade-offs:** JWTs cannot be easily revoked before expiration without implementing a database-backed blocklist. However, for a lightweight API, the stateless speed and ease of integration outweigh the revocation complexity of sessions.

## 3. External Integration: Discord Webhook

- **Why it was chosen:** Discord webhooks offer instantaneous, reliable delivery of rich-text payloads with minimal configuration overhead. It is highly observable for testing cron jobs.
- **Alternatives considered:** Email Provider (SendGrid/Resend).
- **Trade-offs:** Email APIs often suffer from sandbox restrictions, delivery delays, or spam filtering during testing. Webhooks guarantee immediate confirmation that the background worker fired correctly.

## 4. Background Job Deployment: Persistent Render Server

- **Why it was chosen:** The assignment requires checking for overdue items dynamically. I deployed this to Render as a persistent Web Service using `node-cron` running in the same instance as the Express app.
- **Alternatives considered:** Serverless deployment (Vercel) + Vercel Cron.
- **Trade-offs:** Serverless architectures kill background processes between HTTP requests, which would break the standard `node-cron` implementation. Using a persistent server ensures the interval runs continuously without requiring a proprietary serverless cron configuration.
