import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';

function App() {
  // You can add authentication state management here
  const isAuthenticated = false; // Replace with your auth logic

  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/" /> : <Auth />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 