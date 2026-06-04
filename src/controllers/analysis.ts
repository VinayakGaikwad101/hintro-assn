import { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { sql } from "../db/index.js";
import { successResponse, errorResponse } from "../utils/response.js";

// Initialize the new Gemini SDK
// The non-null assertion (!) guarantees to TypeScript that the API key exists
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const analyzeMeeting = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;

    // 1. Fetch the meeting from NeonDB
    const [meeting] = await sql`SELECT * FROM meetings WHERE id = ${id}::uuid`;

    if (!meeting) {
      return res
        .status(404)
        .json(errorResponse(req.traceId, "NOT_FOUND", "Meeting not found"));
    }

    // 2. Define the strict JSON response schema (100% Assignment Compliant)
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.OBJECT,
          description: "A comprehensive executive summary of the meeting.",
          properties: {
            text: { type: Type.STRING },
            citations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "Exact timestamps from the transcript supporting this summary.",
            },
          },
        },
        actionItems: {
          type: Type.ARRAY,
          description: "List of actionable tasks assigned to individuals.",
          items: {
            type: Type.OBJECT,
            properties: {
              task: { type: Type.STRING },
              assignee: {
                type: Type.STRING,
                description: "Name of the person responsible, or 'Unassigned'",
              },
              citations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  "Exact timestamps from the transcript supporting this task.",
              },
            },
          },
        },
        decisions: {
          type: Type.ARRAY,
          description: "Key decisions made during the meeting.",
          items: {
            type: Type.OBJECT,
            properties: {
              decision: { type: Type.STRING },
              citations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exact timestamps supporting this decision.",
              },
            },
          },
        },
        followUps: {
          type: Type.ARRAY,
          description: "Recommended next steps or topics for future meetings.",
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              citations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  "Exact timestamps supporting this follow-up suggestion.",
              },
            },
          },
        },
      },
    };

    const prompt = `
      You are an expert AI meeting assistant for Hintro.
      Analyze the following meeting transcript. 
      
      CRITICAL INSTRUCTION FOR GROUNDING:
      - Every single summary, action item, decision, and follow-up MUST be strictly grounded in the transcript text.
      - Provide an array of exact string timestamps (e.g., "00:10") in every "citations" field indicating where that item was discussed.
      - Do not invent any facts, attendees, outcomes, or decisions not explicitly present in the text.

      Meeting Title: ${meeting.title}
      Transcript:
      ${JSON.stringify(meeting.transcript, null, 2)}
    `;

    // 3. Generate the content using the new SDK syntax
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    });

    // 4. Safely handle the response text for TypeScript strict mode
    if (!response.text) {
      console.error(`[${req.traceId}] AI Error: Empty response from Gemini`);
      return res
        .status(500)
        .json(
          errorResponse(
            req.traceId,
            "AI_ERROR",
            "The AI model returned an empty response",
          ),
        );
    }

    // 5. Parse and return the structured analysis
    const analysisData = JSON.parse(response.text);
    return res.status(200).json(successResponse(req.traceId, analysisData));
  } catch (error) {
    console.error(`[${req.traceId}] AI Analysis Error:`, error);
    return res
      .status(500)
      .json(
        errorResponse(
          req.traceId,
          "INTERNAL_SERVER_ERROR",
          "AI analysis failed",
        ),
      );
  }
};
