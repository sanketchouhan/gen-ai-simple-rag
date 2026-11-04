import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";

async function generateVectorEmbeddingsForFile(filepath) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required. Add it to your .env file.");
  }

  // Load the PDF content as document
  const loader = new PDFLoader(filepath);
  const document = await loader.load();

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    outputDimensionality: 1536,
    apiKey,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "chaicode-docs",
    },
  );

  await vectorStore.addDocuments(document);
  console.log("All documents have been indexed.");
}

generateVectorEmbeddingsForFile("dsa.pdf").catch((error) => {
  console.error("Document indexing failed:", error);
  process.exitCode = 1;
});
