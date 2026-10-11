// src/Pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../Api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ KRİTİK DÜZELTME: DOĞRU ENDPOINT
      const response = await api.post('/Auth/login', {
        email: email,
        password: password
      });

      // ✅ TOKEN'I KAYDET
      const token = response.data.token;
      localStorage.setItem('token', token);

      toast.success("Hoşgeldiniz! Giriş Başarılı.");

      // ✅ GİRİŞ SONRASI ANA SAYFA
      navigate('/');
      window.location.reload(); // Navbar güncellensin diye

    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        "Giriş Yapılamadı! Bilgilerinizi kontrol edin.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>

        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-gray-900 tracking-wider">
            BAŞYAZICI
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-[0.3em] mt-1">
            Geleneksel Lezzet
          </p>
          <h2 className="mt-8 text-2xl font-bold text-gray-800">
            Tekrar Hoşgeldiniz
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            
            {/* Email */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400 group-focus-within:text-red-600 transition-colors" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                placeholder="E-Posta Adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Şifre */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400 group-focus-within:text-red-600 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-red-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white 
              ${isLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:shadow-lg'} 
              transition-all duration-300`}
          >
            {isLoading ? "Giriş Yapılıyor..." : (
              <span className="flex items-center gap-2">
                GİRİŞ YAP <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="font-medium text-red-600 hover:underline">
                Hemen Kayıt Olun
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
