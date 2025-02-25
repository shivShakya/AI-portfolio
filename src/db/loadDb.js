import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import 'dotenv/config';
import { HfInference } from "@huggingface/inference";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { UUID } from "@datastax/astra-db-ts";

// Astra DB Configuration



const inference = new HfInference(hfToken);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readJSONFiles = (dir = '') => {
  const directoryPath = path.join(__dirname, '../../public', dir);

  const readDirectory = (currentDir) => {
    let results = [];
    const files = fs.readdirSync(currentDir);

    files.forEach((file) => {
      const filePath = path.join(currentDir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        results = results.concat(readDirectory(filePath));
      } else if (path.extname(file) === '.json') {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          try {
            const parsedContent = JSON.parse(content);
            results.push(parsedContent);
          } catch (jsonError) {
            console.error(`Error parsing JSON in file ${filePath}:`, jsonError.message);
          }
        } catch (readError) {
          console.error(`Error reading file ${filePath}:`, readError.message);
        }
      }
    });

    return results;
  };

  return readDirectory(directoryPath);
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
  const jsonDataArray = readJSONFiles('');

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
          content: chunk,
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

