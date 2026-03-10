import { GoogleGenAI, Type } from "@google/genai";
import { Vitals, TriageLevel, TriageAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function predictTriage(
  patientName: string,
  age: number,
  arrivalMode: string,
  vitals: Vitals,
  symptoms: string[]
): Promise<TriageAnalysis> {
  const prompt = `
    Perform a clinical triage assessment for the following patient:
    Name: ${patientName}
    Age: ${age}
    Arrival Mode: ${arrivalMode}
    Vitals:
      - Heart Rate: ${vitals.heartRate} bpm
      - Blood Pressure: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
      - SpO2: ${vitals.spO2}%
      - Temperature: ${vitals.temperature}°C
      - Pain Level: ${vitals.painLevel}/10
    Symptoms: ${symptoms.join(', ')}

    Based on clinical protocols, provide a detailed triage analysis in JSON format.
    Triage Levels: Emergency (Red), Urgent (Orange), Routine (Green), Self-care (Blue).

    The JSON must follow this schema:
    {
      "triageLevel": "Emergency" | "Urgent" | "Routine" | "Self-care",
      "priorityScore": number (0-100, percentage based on urgency),
      "severityScore": number (0-100, overall clinical severity),
      "status": string (e.g., "Critical Risk", "Moderate Risk", "Stable"),
      "reasoning": string[] (list of clinical observations),
      "riskIndicators": [
        { "label": "Heart Rate", "value": "130 bpm", "status": "High" | "Normal" | "Low" | "Critical" },
        ...
      ],
      "criticalAlerts": string[] (list of immediate life threats if any)
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          triageLevel: {
            type: Type.STRING,
            enum: ["Emergency", "Urgent", "Routine", "Self-care"],
          },
          priorityScore: { type: Type.NUMBER },
          severityScore: { type: Type.NUMBER },
          status: { type: Type.STRING },
          reasoning: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          riskIndicators: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["Normal", "High", "Low", "Critical"] }
              },
              required: ["label", "value", "status"]
            }
          },
          criticalAlerts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["triageLevel", "priorityScore", "severityScore", "status", "reasoning", "riskIndicators", "criticalAlerts"],
      },
    },
  });

  let text = response.text || "{}";
  // Remove markdown code blocks if present
  if (text.includes("```json")) {
    text = text.split("```json")[1].split("```")[0];
  } else if (text.includes("```")) {
    text = text.split("```")[1].split("```")[0];
  }

  try {
    return JSON.parse(text.trim()) as TriageAnalysis;
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", error);
    // Return a fallback analysis if parsing fails
    return {
      triageLevel: "Routine",
      priorityScore: 0,
      severityScore: 0,
      status: "Error in Analysis",
      reasoning: ["The AI response could not be parsed. Please perform manual triage."],
      riskIndicators: [],
      criticalAlerts: ["Analysis Error"]
    };
  }
}
