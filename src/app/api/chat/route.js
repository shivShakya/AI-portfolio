import { NextResponse } from 'next/server';
import { DataAPIClient } from '@datastax/astra-db-ts';
import { HfInference } from "@huggingface/inference";
import { Groq } from 'groq-sdk';

// Astra DB Configuration
const token = process.env.ASTRA_DB_TOKEN;
const ENDPOINT = process.env.ASTRA_DB_ENDPOINT;
const namespace = process.env.ASTRA_DB_NAMESPACE;
const collectionName = process.env.ASTRA_DB_COLLECTION;
const hfToken = process.env.HF_TOKEN;
const groqApiToken = process.env.GROQ_API_TOKEN;

// Hugging Face API Key
const inference = new HfInference(hfToken);
const client = new DataAPIClient(token);
const db = client.db(ENDPOINT, { namespace });
const chatGroq = new Groq({
  apiKey: groqApiToken
});

const chatHistoryMap = new Map();

export async function POST(request) {
  try {
    const { prompt , sessionId} = await request.json();

    if (!prompt || !sessionId) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let docContext = "";
    const embedding = await inference.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: prompt,
    });

    const collection = await db.collection(collectionName);

    const cursor = collection.find(null, {
      sort: {
        $vector: embedding
      },
      limit: 5,
    });

    const documents = await cursor.toArray();
    docContext = `
        START CONTEXT
       ${documents?.map(doc => doc.description).join("\n")}
        END CONTEXT
    `;

    const chatHistory = chatHistoryMap.get(sessionId) || [];

    const fullHistory = [
      {
        role: 'system',
        content: `You are an AI Assistant responding on Shivam Shakya's Portfolio Site.
${docContext}
Do not create information of your own . the information you are giving is valuable so do not say anything out of the context.
Your responses should strictly follow this format:
{
  "response": "[Answer based on the provided context or a default apology message]"
}
If the response falls under a specific category, include the relevant "link" field with one of the following values: "project", "blog", "education", "experience", "contact", "skills", or "resume".
If the response is related to a specific path, include the "path" field with one of the following values: ["face-recognition", "craftstore", "chatbot", "Department_project", "faceswap", "finetune", "VR_Projects", "zoo", "Aamchi_mess"].
If "path" is set, do not include "link".
If "link" is set, do not include "path".
Sometimes, the "path" field might appear outside the JSON format—ensure it is correctly placed inside the JSON.
Examples:
For a project-related response:
{
  "response": "Here are the details of my recent project on face recognition.",
  "link": "project"
}
For a path-related response:

{
  "response": "This project uses deep learning for face detection.",
  "path": ["face-recognition"]
}
For a general response without a category or path:
{
  "response": "I'm sorry, but I couldn't find relevant details."
}
          ${chatHistory.map(entry => `Role: ${entry.role}, Message: ${entry.content}`).join("\n")}
        `
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const completion = await chatGroq.chat.completions.create({
      messages: fullHistory,
      model: "llama3-70b-8192"
    });

    const responseContent = completion.choices[0]?.message?.content;
    console.log({ responseContent });

    // Update chat history
    chatHistory.push({ role: "user", content: prompt });
    chatHistory.push({ role: "assistant", content: responseContent });
    chatHistoryMap.set(sessionId, chatHistory);
    return NextResponse.json({
      response: responseContent
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
