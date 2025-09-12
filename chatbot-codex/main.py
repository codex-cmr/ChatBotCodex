from fastapi import FastAPI, HTTPException
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from codex_bot import LLMService, Question, Response
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title= "Chatbot Codex")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
llm_service = LLMService()

# Retrieval Augmented Generation

rag_chain = llm_service.create_rag_chain(model="openai/gpt-oss-120b")
app.mount("/static", StaticFiles(directory="static"), name="static")
@app.get("/")
def root():
    return FileResponse("static/index.html")
@app.post("/api/v1/process_query")
def process_query (request : Question):
    try:
        question = Question(query= request.query)
        answer = rag_chain.invoke(question.query)
        response = Response(answer= answer)
        return  response.fetch_answer()
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error processing user query!")

if __name__=="__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8081)

