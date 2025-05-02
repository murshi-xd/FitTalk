import os
import logging
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_pinecone import PineconeVectorStore

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Extract Data From PDF Files
def load_pdf_file(data_path):
    try:
        if not os.path.exists(data_path):
            logging.error(f"Directory '{data_path}' not found.")
            raise FileNotFoundError(f"Directory '{data_path}' does not exist.")

        loader = DirectoryLoader(
            data_path,
            glob='*.pdf',
            loader_cls=PyPDFLoader
        )
        documents = loader.load()

        return documents

    except Exception as e:
        logging.exception("Error loading PDF files.")
        raise

# Split the Data into Text Chunks
def text_split(extracted_data):
    try:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=20)
        text_chunks = text_splitter.split_documents(extracted_data)

        return text_chunks

    except Exception as e:
        logging.exception("Error splitting text into chunks.")
        raise

# Load the Embeddings from HuggingFace
def download_hugging_face_embeddings():
    try:
        embeddings = HuggingFaceBgeEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        return embeddings

    except Exception as e:
        logging.exception("Error downloading HuggingFace embeddings.")
        raise

# Load Existing Pinecone Index
def load_pinecone_index(index_name, embeddings):
    try:
        docsearch = PineconeVectorStore.from_existing_index(
            index_name=index_name,
            embedding=embeddings
        )
        return docsearch

    except Exception as e:
        logging.exception(f"Error loading Pinecone index '{index_name}'.")
        raise
