import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Scan from './pages/Scan';
import CustomerCard from './pages/CustomerCard';
import History from './pages/History';

function PrivateRoute({ children }) {
  return localStorage.getItem('staffToken') ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/scan" element={<PrivateRoute><Scan /></PrivateRoute>} />
        <Route path="/customer" element={<PrivateRoute><CustomerCard /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/scan" />} />
      </Routes>
    </BrowserRouter>
  );
}
