import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "20mb" }));

// New GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// MULTI-DIGIT MODEL
const MODEL_NAME = "gemini-2.0-flash";

app.post("/predict", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ number: "No image" });
    }

    const base64 = image.split(",")[1]; // remove data:image/... prefix

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Identify the full handwritten number in this image. " +
                "Respond ONLY with the digits. No explanation, no words.",
            },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64,
              },
            },
          ],
        },
      ],
    });

    const text = response.text?.trim?.() || "";
    const number = text.replace(/\D/g, ""); // extract full number

    res.json({ number: number || "Error" });
  } catch (err) {
    console.error("Gemini ERROR:", err);
    res.json({ number: "Error" });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
