# Changelog

All notable changes to the Hintro Meeting Intelligence Service will be documented in this file.

## [1.0.0] - 2026-06-04

### Added (Milestones)

- **Milestone 1:** Initialized project with Express, TypeScript, and unified response formatting/trace IDs.
- **Milestone 2:** Integrated PostgreSQL (via Neon) and established data models for Meetings and Action Items.
- **Milestone 3:** Implemented JWT-based authentication for securing the API endpoints.
- **Milestone 4:** Built the AI Analysis endpoint using the Google Gemini API, enforcing strict JSON schema outputs and transcript citations to prevent hallucinations.
- **Milestone 5:** Implemented the action item tracking endpoints (Create, Update Status, List Overdue).
- **Milestone 6:** Integrated `node-cron` for minute-by-minute overdue action item detection.
- **Milestone 7:** Configured external Discord webhook integration for automated reminder delivery.
- **Milestone 8:** Finalized global error handling, Swagger OpenAPI documentation, and deployed to Render.
