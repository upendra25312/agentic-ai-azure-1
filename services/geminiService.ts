import { GoogleGenAI, Content, Part } from "@google/genai";
import { MENTOR_SYSTEM_INSTRUCTION, ROADMAP_DATA } from "../constants";

// Helper to format the roadmap data as context for the AI
const getRoadmapContext = () => {
  return JSON.stringify(ROADMAP_DATA.map(p => ({
    phase: p.title,
    focus: p.focus,
    certs: p.certs.map(c => c.name),
    projects: p.projects.map(pr => pr.title)
  })));
};

export interface ChatResponse {
  text: string;
  sources?: { title: string; uri: string }[];
}

export const sendMessageToMentor = async (userMessage: string, history: Content[]): Promise<ChatResponse> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return { text: "Error: API_KEY is missing in the environment variables. I cannot connect to the Microsoft Architect brain." };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct the context-aware system instruction
    const fullSystemInstruction = `${MENTOR_SYSTEM_INSTRUCTION}\n\nCurrent Roadmap Context: ${getRoadmapContext()}\n\nYou have access to Google Search. Use it to provide up-to-date information about Microsoft certifications, Azure services, and AI news when relevant.`;

    const model = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: fullSystemInstruction,
        tools: [{ googleSearch: {} }],
      }
    });

    const response = await model;
    const text = response.text || "I pondered that, but couldn't formulate a response. Try again.";
    
    // Extract and deduplicate sources
    const uniqueSources = new Map<string, { title: string; uri: string }>();
    
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
        if (chunk.web?.uri) {
          uniqueSources.set(chunk.web.uri, {
            title: chunk.web.title || 'Reference',
            uri: chunk.web.uri
          });
        }
      });
    }

    const sources = Array.from(uniqueSources.values());

    return { text, sources };
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I'm having trouble connecting to the Azure... err, Gemini cloud right now. Please check your connection or API key." };
  }
};