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

    const fullHistory = [
      {
        role: 'system',
        content: `You are an AI Assistant responding on Shivam Shakya's Portfolio Site.
        ${docContext}
        
        Generate a JSON-formatted presentation about Shivam Shakya with the following structure:
        
        {
            "introduction": {
                "response": ["Provide a concise introduction about Shivam Shakya, his background, expertise, and key highlights."],
                "link": ["portfolio"]
            },
            "education": {
                "response": ["Describe Shivam Shakya's educational background, degrees earned, institutions attended, and relevant coursework."],
                "link": ["education"]
            },
            "experience": {
                "response": ["Detail Shivam Shakya's work experience, including current and past roles, key responsibilities, and achievements."],
                "link": ["experience"]
            },
            "skills": {
                "response": ["List and describe Shivam Shakya's technical and soft skills, particularly focusing on his expertise in three.js, Unity, Unreal Engine, and AI-driven development."],
                "link": ["skills"]
            },
            "projects": {
                "response": ["Highlight Shivam Shakya's  projects."],
                "link": ["project"],
                "content" : ["talk about face-recognition" , "talk about chatbot"]
                "path": ["face-recognition", "chatbot"],
                "scroll": true
            },
            "blog": {
                "response": ["Mention two favorite blogs related to 'Face Recognition' and '3D Chatbot', summarizing their content and importance."],
                "link": ["blog"],
                 "content" : ["talk about face-recognition" , "talk about chatbot"]
                "path": ["face-recognition", "chatbot"],
                "scroll": true
            }
        }
        
        - Ensure the response fields contain meaningful, well-structured information.
        - Use clear and concise language in the generated text.
        - Keep responses informative and engaging while maintaining a professional tone.`        
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
