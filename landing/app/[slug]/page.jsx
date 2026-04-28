'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function SlugLanding() {
  const { slug } = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState('landing');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`/api/dashboard/restaurant-by-slug/${slug}`)
      .then((r) => {
        setRestaurant(r.data);
        sessionStorage.setItem('enroll_restaurantId', r.data._id);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { phone: `+92${phone}` });
      sessionStorage.setItem('enroll_name', name);
      sessionStorage.setItem('enroll_phone', `+92${phone}`);
      router.push(`/${slug}/verify`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <h1 className="text-xl font-bold mb-1">Restaurant not found</h1>
          <p className="text-gray-500 text-sm">The link "{slug}" doesn't match any active restaurant.</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-gray-400">Loading...</div>;
  }

  if (step === 'landing') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: restaurant.brand_color, color: restaurant.accent_color }}
      >
        {restaurant.logo_url && (
          <img src={restaurant.logo_url} alt="logo" className="w-24 h-24 rounded-2xl mb-4 object-cover" />
        )}
        <h1 className="text-3xl font-bold mb-1">{restaurant.name}</h1>
        <p className="opacity-70 mb-2">Earn rewards every visit</p>
        <p className="text-sm opacity-50 mb-8">
          Earn {restaurant.points_per_100} points per PKR 100 spent
        </p>
        <button
          onClick={() => setStep('phone')}
          className="w-full max-w-xs py-3 rounded-xl font-semibold text-lg mb-3"
          style={{ backgroundColor: restaurant.accent_color, color: restaurant.brand_color }}
        >
          Get My Loyalty Card
        </button>
        <button
          onClick={() => router.push(`/${slug}/login`)}
          className="text-sm opacity-60 underline"
        >
          I already have a card
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: restaurant.brand_color, color: restaurant.accent_color }}
    >
      <h2 className="text-2xl font-bold mb-6">Create your card</h2>
      <form onSubmit={handleSendOtp} className="w-full max-w-xs space-y-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-xl px-4 py-3 text-lg focus:outline-none placeholder-white placeholder-opacity-50"
          style={{ color: restaurant.accent_color }}
        />
        <div className="flex rounded-xl overflow-hidden border border-white border-opacity-30">
          <span className="bg-white bg-opacity-10 px-3 py-3 font-mono opacity-70">+92</span>
          <input
            type="tel"
            placeholder="3001234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="flex-1 bg-white bg-opacity-10 px-3 py-3 text-lg focus:outline-none placeholder-white placeholder-opacity-50"
            style={{ color: restaurant.accent_color }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-lg disabled:opacity-50"
          style={{ backgroundColor: restaurant.accent_color, color: restaurant.brand_color }}
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}
