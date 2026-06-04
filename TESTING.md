# Testing Documentation

This document outlines the testing strategies, scenarios executed, and edge cases considered during the development of the Meeting Intelligence Service.

## Test Scenarios Executed

1. **Meeting Creation & Retrieval:**
   - Successfully created meetings with valid participants and transcripts.
   - Verified that pagination correctly limits the number of returned meetings.
2. **AI Analysis Generation:**
   - Submitted valid transcripts and verified the structured output matches the schema.
   - Verified that every generated summary and action item contains a valid timestamp citation linking back to the transcript payload.
3. **Action Item Management:**
   - Created action items linked to specific meeting IDs.
   - Updated statuses (`PENDING`, `IN PROGRESS`, `COMPLETED`) and verified that invalid statuses are rejected.
4. **Cron Job & Notifications:**
   - Created an action item with a `dueDate` in the past and a status of `PENDING`.
   - Verified that the `node-cron` scheduler identified the overdue item and successfully triggered the Discord Webhook.

## Edge Cases Considered

- **Malformed JSON Payloads:** Tested the global error handler by submitting invalid JSON. The server successfully intercepts the `SyntaxError` and returns a `400 MALFORMED_REQUEST` rather than crashing.
- **Empty Transcripts:** Ensure the AI handles empty or overly brief transcripts gracefully without hallucinating outcomes.
- **Invalid Timestamps:** Validated that the AI pipeline strictly adheres to the provided timestamps and does not invent sequential times.

## Limitations Discovered

- **Cron Job Scalability:** Currently, the `node-cron` job runs within the single Node.js instance. In a horizontally scaled environment with multiple instances, this could cause duplicate notifications unless a distributed lock (e.g., Redis) is implemented.
