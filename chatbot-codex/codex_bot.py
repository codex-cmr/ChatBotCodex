import logging
import os.path
from dataclasses import dataclass

from langchain_community.document_loaders import JSONLoader
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq
from langchain_openai import OpenAIEmbeddings
from dotenv import  load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

@dataclass
class Question:
    query: str

@dataclass
class Response:
    answer: str

    def fetch_answer(self):
        return {
            "answer":self.answer
        }

INDEX_PATH = "codex-db"
DATABASE_PATH = "/home/htsago/Dokumente/chatbot-codex/data/faq-codex.json"
SYSTEM_PROMPT_TEMPLATE =""" 
        Tu es un assistant utile qui repond aux questions de l'utilisateur basees sur du context fourni
        Contexte: {context}
        Question: {question}
        
        Attention, renvoies ta reponse sans le format Markdown!
"""
class LLMService:

    def __init__(self):
        self.prompt = ChatPromptTemplate.from_template(SYSTEM_PROMPT_TEMPLATE)
        self.retriever = self._initialize_retriever()

    def _initialize_retriever(self):
        try:
            loader = JSONLoader(
                file_path=DATABASE_PATH,
                jq_schema='."codex-faq"[] | @json'
            )
            docs = loader.load()
            embeddings = OpenAIEmbeddings()

            if os.path.exists(INDEX_PATH):
                vectordb = FAISS.load_local(
                    embeddings=embeddings,
                    folder_path=INDEX_PATH,
                    allow_dangerous_deserialization=True
                )
            else:
                vectordb = FAISS.from_documents(docs,embeddings)
                vectordb.save_local(folder_path=INDEX_PATH)

            return vectordb.as_retriever(
                search_type="mmr", # similarity
                search_kwargs={"k": 4, "fetch_k":8}
            )
        except Exception as e:
            logger.error(f"Error initializing retriever: {str(e)}")
            raise

    def get_llm(self, model):
        return ChatGroq(model = model,temperature = 0.98) #https://console.groq.com/docs/api-reference#chat


    def create_rag_chain(self, model: str):

        def format_docs(docs):
            return "\n".join(doc.page_content for doc in docs)

        return ({
            "question": RunnablePassthrough(), "context": self.retriever |format_docs
            }
            |self.prompt
            |self.get_llm(model)
            | StrOutputParser()
            )

