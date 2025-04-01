# ExamGenius

ExamGenius is a full-stack web application designed to assist students in preparing for their exams by leveraging AI to generate syllabi, find relevant resources, and create personalized study plans.


## Project Summary

ExamGenius transforms exam preparation through AI-powered tools that help students organize and optimize their study time. The application analyzes syllabus documents to extract key topics, determines their relative importance, estimates required study time, and then generates personalized study plans. Students can also access curated learning resources specifically tailored to each topic in their syllabus, making exam preparation more efficient and effective.

## Features

- **AI Syllabus Analysis:** Upload a syllabus (PDF, DOCX, TXT) to automatically extract topics, assess importance, and estimate study time using AI.
- **Curated Topic Resources:** Click on any topic from the analysis results to get AI-curated video and article recommendations (with explanations) specifically for that topic, suitable for beginner/intermediate levels.
- **Personalized Study Plan Generation:** Create structured study schedules based on the syllabus analysis, organizing tasks into logical sessions.
- **General Resource Search:** Manually search for learning resources across the web using custom queries.

## Tech Stack

- **Backend:**
  - Python
  - FastAPI
  - Uvicorn
  - AI Integrations (Gemini, Tavily)
- **Frontend:**
  - React
  - TypeScript
  - Vite
  - Material UI (MUI)
  - React Router
- **Containerization:**
  - Docker
  - Docker Compose

## Prerequisites

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (for containerized setup)
- [Node.js and npm](https://nodejs.org/) (v18+ recommended, for local frontend development)
- [Python](https://www.python.org/) (v3.9+ recommended, for local backend development)
- API Keys:
  - `GEMINI_API_KEY` (From Google AI Studio)
  - `TAVILY_API_KEY` (From Tavily API)

## Setup & Running

There are two ways to run ExamGenius: using Docker (recommended for ease of setup) or running the frontend and backend locally.

### 1. Running with Docker (Recommended)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Dharshan2208/ExamGenius.git
    cd ExamGenius
    ```

2.  **Configure Backend Environment:**

    - Navigate to the `backend` directory: `cd backend`
    - Create a `.env` file (you can copy `.env.example` if it exists).
    - Add your API keys to the `.env` file:
      ```dotenv
      GEMINI_API_KEY=YOUR_GEMINI_API_KEY
      TAVILY_API_KEY=YOUR_TAVILY_API_KEY
      # Add any other necessary backend variables
      ```
    - Return to the root directory: `cd ..`

3.  **Build and Run with Docker Compose:**

    - From the root `ExamGenius` directory, run:
      ```bash
      docker-compose up --build -d # Use -d to run in detached mode
      ```
    - This command will build the Docker images and start the containers.

4.  **Access the Application:**

    - **Frontend:** Open your browser to `http://localhost:5173`
    - **Backend API Docs:** Access the interactive API docs (Swagger UI) at `http://localhost:8000/docs`

5.  **Stopping the Application:**
    ```bash
    docker-compose down
    ```

### 2. Running Locally (Without Docker)

#### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Environment Variables:**
    - Create a `.env` file in the `backend` directory.
    - Add your API keys:
      ```dotenv
      GEMINI_API_KEY=YOUR_GEMINI_API_KEY
      TAVILY_API_KEY=YOUR_TAVILY_API_KEY
      # Add any other necessary backend variables
      ```
5.  **Run the FastAPI development server:**
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```
    - The backend API will be available at `http://localhost:8000`.

#### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    # From the project root
    cd frontend
    # Or from the backend directory
    # cd ../frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables (Optional):**
    - If the frontend requires environment variables (e.g., for the backend URL), create a `.env` file in the `frontend` directory.
      ```dotenv
      VITE_API_BASE_URL=http://localhost:8000 # Example if needed
      ```
4.  **Run the Vite development server:**
    ```bash
    npm run dev
    ```
    - The frontend application will be available at `http://localhost:5173`.

## Environment Variables

The following environment variables are required for the application:

**Backend (`backend/.env`):**

- `GEMINI_API_KEY`: Your API key for Google Gemini.
- `TAVILY_API_KEY`: Your API key for the Tavily search API.

**Frontend (`frontend/.env` - Create if needed):**

- `VITE_API_BASE_URL`: (Optional) Base URL for the backend API if it differs from the default expected by the frontend.

## Project Structure

```
ExamGenius/
├── backend/
│   ├── app/         # FastAPI application code (main.py, api, services, etc.)
│   ├── venv/        # Python virtual environment (if running locally)
│   ├── Dockerfile   # Dockerfile for the backend service
│   ├── requirements.txt # Python dependencies
│   └── .env         # Environment variables (needs to be created)
├── frontend/
│   ├── public/      # Static assets
│   ├── src/         # React application source code
│   ├── node_modules/ # Node.js dependencies (if running locally)
│   ├── Dockerfile   # Dockerfile for the frontend service
│   ├── package.json # Node.js dependencies and scripts
│   ├── vite.config.ts # Vite configuration
│   └── .env         # Environment variables (optional, needs to be created if required)
├── docker-compose.yml # Defines Docker services for containerized setup
├── .gitignore       # Specifies intentionally untracked files
├── LICENSE          # GNU AFFERO GENERAL PUBLIC LICENSE file
└── README.md        # This file
```

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Contributors

- **[Arham Garg](https://github.com/arhamgarg)**
- **[Dharshan2208](https://github.com/Dharshan2208)**
- **[Jestifer Harold](https://github.com/JestiferHarold)**

## Contributing

Contributions are welcome! Please follow standard fork & pull request workflows. Consider creating an issue to discuss significant changes beforehand.
