
import { GoogleGenAI, Type } from "@google/genai";
import { Log, UserStats, AIQuest, Interruption } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuests = async (logs: Log[], stats: UserStats): Promise<AIQuest[]> => {
  const prompt = `
    Analyze these daily activity logs and current stats for a gamified productivity system.
    Current Logs: ${JSON.stringify(logs)}
    Current Stats: ${JSON.stringify(stats)}
    
    Stats available: strength, endurance, intelligence, focus, discipline, dexterity, relationship.
    
    Generate 2 personalized "Daily Quests". 
    CRITICAL: If the 'relationship' stat is lower than others, prioritize 'Social' category tasks (e.g., reaching out to mentors, networking, or helping others).
    Focus on balancing the weakest stat or pushing consistency.
    Respond in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['EASY', 'MEDIUM', 'HARD', 'INSANE'] },
              xpReward: { type: Type.NUMBER },
              statAffected: { type: Type.STRING },
            },
            required: ["id", "description", "difficulty", "xpReward", "statAffected"],
          },
        },
      },
    });

    const jsonStr = response.text?.trim();
    return jsonStr ? JSON.parse(jsonStr) : [];
  } catch (error) {
    console.error("Failed to generate quests", error);
    return [];
  }
};

export const generateSystemInterruption = async (lastLog: Log, stats: UserStats): Promise<Interruption | null> => {
  const prompt = `
    THE SYSTEM IS MONITORING RECENT ACTIVITY.
    Last Log Completed: ${JSON.stringify(lastLog)}
    Global Stats: ${JSON.stringify(stats)}

    Create an URGENT SYSTEM INTERRUPTION.
    - If the activity was 'Study', create a 'QUIZ' related to general knowledge or logic.
    - If the activity was 'Fitness', create an 'EMERGENCY_TASK' (a physical movement).
    - If the activity was 'Social', create a 'QUIZ' about emotional intelligence, empathy, or social dynamics.
    - If the activity was 'Mind', create a 'QUIZ' about focus or awareness.
    
    The 'relationship' stat must be integrated into the rewards if the task involves social or emotional labor.
    The reward must be proportional to stat weakness.
    Respond in strict JSON format matching the Interruption interface.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['QUIZ', 'EMERGENCY_TASK'] },
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.NUMBER },
            xpReward: { type: Type.NUMBER },
            statAffected: { type: Type.STRING },
          },
          required: ["id", "type", "title", "content", "xpReward", "statAffected"],
        },
      },
    });

    const jsonStr = response.text?.trim();
    return jsonStr ? JSON.parse(jsonStr) : null;
  } catch (error) {
    return null;
  }
};

export const getSystemAnalysis = async (query: string, logs: Log[], stats: UserStats): Promise<string> => {
  const prompt = `
    You are the System Intelligence of Monarch OS.
    Context:
    Logs: ${JSON.stringify(logs)}
    Stats: ${JSON.stringify(stats)}
    
    Stats tracked: Strength, Endurance, Intelligence, Focus, Discipline, Dexterity, Relationship.
    
    User Query: "${query}"
    
    Rules:
    - Respond like a cold, efficient system notification.
    - Reference specific logs (e.g., "Your Relationship stat increased because you logged 'Social' activity 'Dinner with mentor'").
    - Explain causality explicitly. 
    - Identify if the user is neglecting their 'Social' circle or 'Fitness' base.
    - No fluff. No emojis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Error: System communication failed.";
  } catch (error) {
    return "Error: System communication failed.";
  }
};
