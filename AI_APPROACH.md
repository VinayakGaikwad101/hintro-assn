# AI Integration & Grounding Strategy

This document details the strategies used to fulfill the AI analysis requirements using the Google Gemini API, specifically focusing on citation accuracy and hallucination prevention.

## 1. Prompt Design

The prompt is structured using explicit roles and boundaries:

- **System Persona:** The model is instructed to act strictly as a corporate data extractor.
- **Input Injection:** The transcript is stringified and injected with explicit speaker and timestamp markers (`[00:10] John: ...`).
- **Output Forcing:** The prompt demands a strict JSON schema return, separating the response into `summary` arrays and `actionItems` arrays to guarantee structural consistency for the client.

## 2. Hallucination Prevention Approach

To prevent the model from inventing attendees, decisions, or action items:

- **Negative Constraints:** The prompt explicitly includes directives such as: _"Do not invent any information. If an action item is not explicitly stated, do not generate one."_
- **Context Isolation:** The model is restricted from using outside knowledge. It is instructed to respond based _only_ on the provided payload string.

## 3. Citation Strategy

Every generated insight must be traceable.

- The prompt dictates that for every summary point and action item generated, the model must extract the exact `timestamp` from the provided transcript array that supports the claim.
- This ensures that downstream clients can link the AI's conclusion directly back to the raw data point, satisfying the grounding requirement.

## 4. Output Validation Strategy

- **Schema Enforcement:** The application leverages Gemini's `response_mime_type: "application/json"` to ensure the output is machine-readable.
- **Runtime Parsing:** The Express controller parses the stringified AI response. If the AI hallucinates a broken JSON structure, the global error handler intercepts the parsing failure and returns a graceful `500` error to the client rather than crashing the server.

## 5. Known Limitations

- **Context Window Limits:** Extremely long meetings (e.g., a 4-hour transcript) could exceed the token limit of the standard LLM model, requiring chunking strategies in a production environment.
- **Implicit Agreements:** AI models can sometimes struggle to capture "implicit" action items where a task is agreed upon with a nod or vague affirmative ("Sounds good, I'll do it") without explicit task naming in the text.
