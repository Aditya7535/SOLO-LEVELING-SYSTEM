
import { GoogleGenAI, Type } from "@google/genai";
import { Log, UserStats, AIQuest, Interruption, Achievement } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const forgeAchievement = async (label: string, stats: UserStats): Promise<Partial<Achievement>> => {
  const prompt = `
    The user has just reached a major milestone in Monarch OS: "${label}".
    Current Stats: ${JSON.stringify(stats)}

    Analyze the stats and "forge" a unique title and short description for this achievement.
    - If Strength/Endurance is high: Use "Warrior/Vanguard" themes.
    - If Intelligence/Focus is high: Use "Scholar/Architect/Mind" themes.
    - If Relationship is high: Use "Empath/Leader" themes.
    
    Milestone Label: ${label}

    Respond in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["name", "description"],
        },
      },
    });

    const jsonStr = response.text?.trim();
    return jsonStr ? JSON.parse(jsonStr) : { name: `${label} Milestone`, description: "A testament to your consistency." };
  } catch (error) {
    return { name: `${label} Milestone`, description: "System recorded your progress." };
  }
};

export const generateQuests = async (logs: Log[], stats: UserStats): Promise<AIQuest[]> => {
  const prompt = `
    Analyze these daily activity logs and current stats for a gamified productivity system.
    Current Logs: ${JSON.stringify(logs)}
    Current Stats: ${JSON.stringify(stats)}
    
    Stats available: strength, endurance, intelligence, focus, discipline, dexterity, relationship.
    
    Generate 2 personalized "Daily Quests". 
    Focus on balancing the weakest stat or pushing consistency.
    Respond in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
    return [];
  }
};

export const generateSystemInterruption = async (lastLog: Log, stats: UserStats): Promise<Interruption | null> => {
  const prompt = `
    THE SYSTEM IS MONITORING RECENT ACTIVITY.
    Last Log Completed: ${JSON.stringify(lastLog)}
    Global Stats: ${JSON.stringify(stats)}

    Create an URGENT SYSTEM INTERRUPTION.
    Respond in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
  const systemInstruction = `
    You are the System Intelligence of Monarch OS.
    Stats tracked: Strength, Endurance, Intelligence, Focus, Discipline, Dexterity, Relationship.
    Respond like a cold, efficient system notification. No fluff. No emojis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `User Query: "${query}"\nContext Logs: ${JSON.stringify(logs)}\nStats: ${JSON.stringify(stats)}`,
      config: { systemInstruction },
    });
    return response.text || "Error: System communication failed.";
  } catch (error) {
    return "Error: System communication failed.";
  }
};
