import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini SDK safely with User-Agent header for telemetry
  let ai: GoogleGenAI | null = null;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("LOGIX Backend: GoogleGenAI client initialized successfully.");
    } else {
      console.log("LOGIX Backend: GEMINI_API_KEY not set or is placeholder. Falling back to local offline coordination simulation.");
    }
  } catch (err) {
    console.error("LOGIX Backend: ERROR initializing GoogleGenAI.", err);
  }

  // API Endpoint: Coordinate agents using live Gemini LLM
  app.post("/api/agents/coordinate", async (req, res) => {
    const { scenarioName, activeConflict, customInput, systemHistory } = req.body;

    if (!ai) {
      return res.status(200).json({
        isOfflineFallback: true,
        message: "Gemini client not initialized. Local offline engine running.",
        conversation: null
      });
    }

    try {
      const prompt = `
You are LOGIX, the AI central kernel operating a futuristic city-scale multi-agent logistics network.
Coordinate a live high-tempo discussion between our 4 Autonomous agents responding to a new disruption.

SCENARIO IN PROGRESS: "${scenarioName}"
CURRENT CONFLICT DETECTED: "${activeConflict || 'None'}"
ADDITIONAL COMMANDER INSIGHT (Custom User Request): "${customInput || 'None'}"

YOUR AGENTS:
1. **Demand Agent**: Monitors real-time order volumes, forecasts market demand trends, and flags surge zones.
2. **Route Agent**: Analyzes street-level road congestion, computes optimal routing graphs, and avoids high-risk nodes (NH48, DND Flyway, Outer Ring Road).
3. **Warehouse Agent**: Manages hub storage capacities, executes inventory balancing, and schedules automated sortation dispatches.
4. **Fleet Agent**: Adjusts truck and EV deployment, optimizes battery ranges, and manages trailer capacity utilization.

COORDINATION GOAL:
Return a strategic, professional, and rapid exchange consisting of 4 to 6 dialog steps. The agents must debate and outline a concrete task sequence to handle the disruption. Make the tone highly analytical, technical, urgent, and precise—resembling SpaceX or Palantir mission control rooms.

Provide the response in raw JSON representing an array of dialogue turns. Use the following structured format exactly without code fences:
[
  {
    "agent": "Demand Agent" | "Route Agent" | "Warehouse Agent" | "Fleet Agent",
    "text": "Dialogue text explaining statistics, observations, or dynamic measures taken.",
    "status": "warning" | "success" | "info" | "action",
    "timestamp": "+3s"
  }
]

No Markdown blocks, no \`\`\`json. Return only the JSON array.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8,
        }
      });

      const responseText = response.text?.trim() || "[]";
      let parsed = [];
      try {
        parsed = JSON.parse(responseText);
      } catch (jsonErr) {
        // Attempt to clean markdown backticks if any slipped through
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
      }

      res.json({
        isOfflineFallback: false,
        conversation: parsed
      });

    } catch (apiError: any) {
      console.error("Gemini Coordination error, falling back:", apiError);
      res.status(200).json({
        isOfflineFallback: true,
        error: apiError?.message || "Gemini execution failed",
        conversation: null
      });
    }
  });

  // Hot Module Replacement/Dev server setup vs Static assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("LOGIX Backend: Vite server integrated in Middleware mode (development).");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("LOGIX Backend: Serving static React files (production mode).");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LOGIX Command Server booted successfully on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server failure:", err);
});
