from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware
from fastapi.staticfiles import StaticFiles

# Import routers
from .api.routes import syllabus, resources, study_plans

# CORS Configuration
origins = [
    "http://localhost:5173", # Default Vite dev server port
    "http://localhost:3000", # Common React dev server port (just in case)
    "https://examgenius-frontend.onrender.com", # Your Render frontend URL
]

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=600,
    )
]

app = FastAPI(
    title="ExamGenius API", 
    version="0.1.0",
    middleware=middleware
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

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