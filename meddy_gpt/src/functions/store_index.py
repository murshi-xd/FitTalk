import os
import logging
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from pinecone.grpc import PineconeGRPC as pinecone
from pinecone import ServerlessSpec

# Custom imports
from src.functions.helper import load_pdf_file, text_split, download_hugging_face_embeddings

# 1. Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# 2. Load environment variables
try:
    load_dotenv()
    PINECONE_API_KEY = os.environ.get('PINECONE_API_KEY')
    
    if not PINECONE_API_KEY:
        raise ValueError("Missing PINECONE_API_KEY in environment variables")
    
    os.environ['PINECONE_API_KEY'] = PINECONE_API_KEY



except Exception as e:
    
    
    logging.error(f"Failed to load environment variables: {e}")
    raise

# 3. Load PDF and prepare chunks
try:

    extracted_data = load_pdf_file(data='Data/')
    

    text_chunks = text_split(extracted_data)
    


except Exception as e:
    logging.error(f"Error processing PDF files: {e}")
    raise

# 4. Load embedding model
try:

    embeddings = download_hugging_face_embeddings()
    


except Exception as e:
    logging.error(f"Failed to load embeddings: {e}")
    raise

# 5. Initialize Pinecone
try:

    pc = pinecone(api_key=PINECONE_API_KEY)
    index_name = "chatbot"


    pc.create_index(
        name=index_name,
        dimension=384,  # Replace with correct model dimension
        metric="cosine",  # Replace with correct metric if needed
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
    


except Exception as e:
    logging.error(f"Error initializing Pinecone or creating index: {e}")
    raise

# 6. Upsert data into Pinecone
try:

    
    docsearch = PineconeVectorStore.from_documents(
        documents=text_chunks,
        index_name=index_name,
        embedding=embeddings
    )
    
    logging.info("Document embeddings upserted successfully.")

except Exception as e:

    logging.error(f"Failed to upsert documents into Pinecone: {e}")
    raise
