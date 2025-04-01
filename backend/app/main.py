from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from .api.routes import syllabus, resources, study_plans

app = FastAPI(title="ExamGenius API", version="0.1.0")

# CORS Configuration
origins = [
    "http://localhost:5173", # Default Vite dev server port
    "http://localhost:3000", # Common React dev server port (just in case)
    "https://examgenius-frontend.onrender.com", # Your Render frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

@app.get("/")
def read_root():
    return {"message": "Welcome to ExamGenius API"}

# Include routers
app.include_router(syllabus.router, prefix="/api/syllabus", tags=["syllabus"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(study_plans.router, prefix="/api/study-plans", tags=["study_plans"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}