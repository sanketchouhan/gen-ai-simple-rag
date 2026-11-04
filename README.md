# Simple RAG

A PDF question-answering app using Gemini embeddings, Gemini chat, and Qdrant.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set your `GEMINI_API_KEY`.
3. Start Qdrant: `docker compose up -d`
4. Put `dsa.pdf` in the project root.
5. Index the PDF: `npm run index`
6. Ask a sample question: `npm run query`

Start the API with `npm start`. The health endpoint is `http://localhost:3000/health`. Send a question with `POST http://localhost:3000/query` and a JSON body such as `{"q":"your question"}`.
