import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv() # load env variables from .env file

# Kết nối Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY) # dùng để tạo JWT

# Đọc biến DEBUG từ môi trường (hoặc mặc định là False)
DEBUG = os.getenv("DEBUG", "False").lower() == "true"