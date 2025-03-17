import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv() # load env variables from .env file

# Kết nối Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
JWT_SECRET = os.getenv("JWT_SECRET")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) # dùng để tạo JWT