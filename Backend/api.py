# API related imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Token relateed imports
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

# Self made libraries
from DatabaseManagerClass import database_manager

# Create API app
app = FastAPI()

# --- Control of access to API ---
# The web pages which can make calls to the API
origins = ["http://localhost:3000", "127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Set the pages which can make requests
    allow_credentials=True,  # Allows sending of tokens and cookies
    allow_methods=["GET", "POST"],  # Only allow GET and POST requests
    allow_headers=["*"]  # Allow any headers to be passed
)