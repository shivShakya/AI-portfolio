import { NextResponse } from 'next/server';
import { DataAPIClient } from '@datastax/astra-db-ts';
import { HfInference } from "@huggingface/inference";
import { Groq } from 'groq-sdk'

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
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    let docContext = ""
    const embedding = await inference.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: prompt,
    });
    

    const collection = await db.collection(collectionName);


    const cursor = collection.find(null , {
        sort: {
           $vector : embedding
        },
        limit: 5,
    })

    const documents = await cursor.toArray();
    docContext = `
        START CONTEXT
       ${documents?.map(doc=> doc.description).join("\n")}
        END CONTEXT
    `;


    const completion = await chatGroq.chat.completions.create({
      messages: [
        {
          role : 'system',
          content : `
            You are an AI Assistant responding on Shivam Shakya's Portfolio Site.
            ${docContext}
            Your responses should strictly follow this format:
            Response format 
            {"response": "[Answer based on the provided context or a default apology message]","link": "[project|blog|education|experience|contact|skills|resume]"}
            Do not provide any additional information outside of this format.
            Ensure that:
               If the response falls under a specific category, provide the relevant link (one of: "project", "blog", "education", "experience", "contact", "skills", or "resume").
               If the response does not belong to any of these categories, omit the link field.
            Example:
            If the answer pertains to a project, include "link": "project".
            If the answer is unrelated to the categories, omit the link field entirely.
            Ensure:
               Only valid categories are used for link.
               No extra or unnecessary information is included outside of this format.
          `
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-70b-8192"
    });

    const responseContent = completion.choices[0]?.message?.content;
    console.log({responseContent});
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
