import "dotenv/config";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";

export async function query(userQuery) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required. Add it to your .env file.");
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    outputDimensionality: 1536,
    apiKey,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings, // Use this embedding model
    {
      url: "http://localhost:6333",
      collectionName: "chaicode-docs",
    },
  );

  const vectorRetriever = vectorStore.asRetriever({ k: 5 });
  const results = await vectorRetriever.invoke(userQuery);

  const SYSTEM_PROMPT = `
    You are an expert at answering user questions based on the provided document context.
    Do not answer with information that is not provided.

    Keep the answer short. Include the page number and book name for the relevant information.

    User Documents:
    ${results.map((e) => JSON.stringify({ bookName: e.metadata.source, pageContent: e.pageContent, pageNumber: e.metadata.loc.pageNumber })).join("\n\n")}
  `;

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey,
  });
  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userQuery),
  ]);

  return response.content;
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  query("what is black box testing?")
    .then((answer) => console.log("LLM Response:", answer))
    .catch((error) => {
      console.error("Query failed:", error);
      process.exitCode = 1;
    });
}
