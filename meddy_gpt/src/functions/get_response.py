import os
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import RetrievalQA
from langchain import hub
from src.functions.helper import download_hugging_face_embeddings, load_pinecone_index

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def get_response(question):
    try:
        load_dotenv()

        # Load API keys from environment
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        openai_api_key = os.getenv("OPENAI_API_KEY")

        if not pinecone_api_key or not openai_api_key:
            logging.error("API keys not found in environment variables.")
            raise EnvironmentError("Missing API keys.")

        os.environ['OPENAI_API_KEY'] = openai_api_key
        os.environ['PINECONE_API_KEY'] = pinecone_api_key


        # Download embeddings
        try:
            embeddings = download_hugging_face_embeddings()
        except Exception as e:
            logging.error(f"Error downloading embeddings: {e}")
            raise

        # Load Pinecone index
        try:
            index_name = 'chatbot'
            docsearch = load_pinecone_index(index_name, embeddings)
        except Exception as e:
            logging.error(f"Error loading Pinecone index: {e}")
            raise

        retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

        # Initialize LLM
        try:
            llm = ChatOpenAI(model="gpt-4o-mini")

        except Exception as e:
            logging.error(f"Error initializing LLM: {e}")
            raise

        # Load prompt from LangChain Hub
        try:
            prompt = hub.pull("rlm/rag-prompt")

        except Exception as e:
            logging.error(f"Error loading prompt from hub: {e}")
            raise

        # Setup Retrieval QA Chain
        try:
            qa_chain = RetrievalQA.from_chain_type(
                llm,
                retriever=retriever,
                chain_type_kwargs={"prompt": prompt}
            )

        except Exception as e:
            logging.error(f"Error setting up QA chain: {e}")
            raise

        # Run QA chain
        try:
            response = qa_chain({"query": question})

            return response
        except Exception as e:
            logging.error(f"Error during QA chain execution: {e}")
            raise

    except Exception as e:
        logging.exception("An unexpected error occurred in get_response.")
        return {"error": str(e)}
