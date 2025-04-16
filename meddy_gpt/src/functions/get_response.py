import os
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import RetrievalQA
from langchain import hub
from src.functions.helper import download_hugging_face_embeddings, load_pinecone_index

logging.basicConfig(level=logging.INFO)

def init_model_resources():
    load_dotenv()

    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")

    os.environ["OPENAI_API_KEY"] = openai_api_key
    os.environ["PINECONE_API_KEY"] = pinecone_api_key

    embeddings = download_hugging_face_embeddings()
    docsearch = load_pinecone_index("chatbot", embeddings)
    retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

    llm = ChatOpenAI(model="gpt-4o-mini")
    prompt = hub.pull("rlm/rag-prompt")

    qa_chain = RetrievalQA.from_chain_type(
        llm,
        retriever=retriever,
        chain_type_kwargs={"prompt": prompt}
    )

    return {"qa_chain": qa_chain}

def get_response(question, model_resources):
    try:
        qa_chain = model_resources["qa_chain"]
        return qa_chain({"query": question})
    except Exception as e:
        logging.exception("❌ Error during QA chain execution.")
        return {"error": str(e)}
