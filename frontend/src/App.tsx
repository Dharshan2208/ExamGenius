// import React from 'react'; // Remove unused import
import { Routes, Route } from 'react-router-dom';

// Import Page Components
import Dashboard from './pages/Dashboard';
import SyllabusUploadPage from './pages/SyllabusUploadPage';
import StudyPlanPage from './pages/StudyPlanPage';
import ResourcesPage from './pages/ResourcesPage';
import AboutPage from './pages/AboutPage';

// Import Layout Component
import Layout from './components/layout/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<SyllabusUploadPage />} />
        <Route path="/plan" element={<StudyPlanPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
