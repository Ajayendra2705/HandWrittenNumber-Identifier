import { GoogleAIFileManager, GoogleGenerativeAI } from "@google/genai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Vercel requires this for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: "Error parsing file" });
      }

      const filePath = files.image.filepath;
      const buffer = fs.readFileSync(filePath);

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });

      const response = await model.generateContent([
        {
          inlineData: {
            mimeType: files.image.mimetype,
            data: buffer.toString("base64"),
          },
        },
        "Recognize the handwritten number in this image. Give only the number.",
      ]);

      const text = response.response.text();
      res.status(200).json({ prediction: text });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
