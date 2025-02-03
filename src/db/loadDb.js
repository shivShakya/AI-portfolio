import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import 'dotenv/config';
import { HfInference } from "@huggingface/inference";
import fs from 'fs';
import path from 'path';
import { UUID } from "@datastax/astra-db-ts";


// Astra DB Configuration
const token = process.env.ASTRA_DB_TOKEN;
const ENDPOINT = process.env.ASTRA_DB_ENDPOINT;
const namespace = process.env.ASTRA_DB_NAMESPACE;
const collectionName = process.env.ASTRA_DB_COLLECTION;
const hfToken = process.env.HF_TOKEN;


// Initialize Hugging Face Inference API
const inference = new HfInference(hfToken);

const readJSONFiles = (dir) => {
  const directoryPath = path.join(process.cwd(), 'public', dir);
  const files = fs.readdirSync(directoryPath);
  return files
    .filter((file) => path.extname(file) === '.json')
    .map((file) => {
      const filePath = path.join(directoryPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    });
};


const client = new DataAPIClient(token);
const db = client.db(ENDPOINT, { namespace: namespace });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const createCollection = async () => {
  try {
    // Add vector indexing at collection creation
    await db.createCollection(collectionName, {
      vector: {
        dimension: 384,
      },
    });
    console.log("Collection created successfully");
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log("Collection already exists");
    } else {
      console.error("Error creating collection:", err);
    }
  }
};

const loadData = async () => {
  const collection = await db.collection(collectionName);
  const jsonDataArray = readJSONFiles('data');

  for (const jsonData of jsonDataArray) {
    const jsonString = JSON.stringify(jsonData);
    const chunks = await splitter.splitText(jsonString);
    for (const chunk of chunks) {
      const embedding = await inference.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: chunk,
      });

      if (embedding.length !== 384) {
        console.error(`Unexpected embedding dimension: ${embedding.length}`);
        continue;
      }

      try {
        await collection.insertOne({
          document_id: UUID.v4(),
          $vector: embedding,
        });
        console.log("Data inserted successfully");
      } catch (insertError) {
        console.error("Error inserting document:", insertError);
      }
    }
  }

  console.log('Data has been added');
};

createCollection().then(() => loadData());
