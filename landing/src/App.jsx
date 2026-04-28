import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Verify from './pages/Verify';
import WalletChoice from './pages/WalletChoice';
import MyCard from './pages/MyCard';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/enroll/phone" element={<Home step="phone" />} />
        <Route path="/enroll/verify" element={<Verify />} />
        <Route path="/enroll/wallet-choice" element={<WalletChoice />} />
        <Route path="/my-card" element={<MyCard />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
