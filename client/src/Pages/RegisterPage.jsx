// src/Pages/RegisterPage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

function RegisterPage() {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    adSoyad: '',
    email: '',
    phoneNumber: '', 
    password: '',
    confirmPassword: '',
    ticariOnay: false,
    kvkkOnay: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // --- TELEFON NUMARASI GİRİŞİ ---
    if (name === 'phoneNumber') {
      // SADECE SAYI VE BOŞLUĞA İZİN VERİYORUZ
      // Kullanıcı "555 123" yazabilsin diye anlık silme/kısaltma yapmıyoruz.
      // Sadece harf girişini engelliyoruz.
      const onlyNumsAndSpaces = value.replace(/[^0-9\s]/g, '');

      setFormData(prev => ({
        ...prev,
        [name]: onlyNumsAndSpaces
      }));
    } 
    // --- DİĞER ALANLAR ---
    else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. ŞİFRE KONTROLÜ
    if (formData.password !== formData.confirmPassword) {
      toast.error("Şifreler eşleşmiyor!");
      return;
    }
    
    // 2. KVKK KONTROLÜ
    if (!formData.kvkkOnay) {
      toast.warn("Lütfen KVKK Aydınlatma Metnini onaylayın.");
      return;
    }

    // --- TELEFON NUMARASI TEMİZLEME VE KONTROL (BURASI KRİTİK) ---
    // Kullanıcının girdiği numaradan tüm boşlukları ve sayı olmayanları siliyoruz
    let cleanPhone = formData.phoneNumber.replace(/\D/g, '');

    // Eğer kullanıcı alışkanlıkla başına '0' koyduysa siliyoruz (örn: 0555 -> 555)
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }
    // Eğer kullanıcı '90' ile başladıysa siliyoruz (örn: 90555 -> 555)
    else if (cleanPhone.startsWith('90') && cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(2);
    }

    // Uzunluk Kontrolü: Başındaki 0 atıldıktan sonra tam 10 hane kalmalı (5XX XXX XX XX)
    if (cleanPhone.length !== 10) {
      toast.error("Telefon numarası başında 0 olmadan 10 haneli olmalıdır. (Örn: 555 123 45 67)");
      return;
    }

    try {
      // Backend'e gönderilecek veriyi hazırlıyoruz
      // cleanPhone artık "5551234567" formatında tertemiz bir string.
      const payload = {
        ...formData,
        phoneNumber: cleanPhone,
        userName: formData.email 
      };

      await api.post('/Auth/register', payload);
      toast.success("Kayıt Başarılı! Şimdi giriş yapabilirsiniz.");
      navigate('/login');
    } catch (error) {
      console.error(error);
      // Backend'den gelen spesifik hata mesajını göstermek istersen:
      // toast.error(error.response?.data?.message || "Kayıt olunamadı.");
      toast.error("Kayıt olunamadı. Lütfen bilgileri kontrol edin.");
    }
  };

  return (
    <div className="flex justify-center bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 mt-6"> 
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Hesap Oluştur</h2>
          <p className="mt-2 text-sm text-gray-600">Aramıza katılın ve lezzetleri keşfedin</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          
          {/* Ad Soyad */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3.5 text-gray-400" />
            <input name="adSoyad" type="text" required placeholder="Adınız Soyadınız"
              className="w-full pl-10 p-3 border rounded-lg focus:border-red-500 outline-none"
              value={formData.adSoyad} onChange={handleChange} />
          </div>

          {/* E-Posta */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
            <input name="email" type="email" required placeholder="E-Posta Adresi"
              className="w-full pl-10 p-3 border rounded-lg focus:border-red-500 outline-none"
              value={formData.email} onChange={handleChange} />
          </div>

          {/* TELEFON ALANI */}
          <div className="relative">
             <div className="flex items-center border rounded-lg focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 overflow-hidden transition-all bg-white">
                
                {/* Sol Kısım: Bayrak ve Kod */}
                <div className="flex items-center bg-gray-50 px-3 py-3 border-r border-gray-200 text-gray-700 min-w-[90px]">
                   <span className="text-xl mr-2">🇹🇷</span>
                   <span className="font-medium text-sm text-gray-600">+90</span>
                </div>

                {/* Sağ Kısım: Numara Girişi */}
                {/* maxLength'i artırdık (15 yaptık) ki kullanıcı boşluklu yazarsa alan yetmezliği yaşamasın */}
                <input 
                  name="phoneNumber" 
                  type="tel" 
                  required 
                  placeholder="(5XX) XXX XX XX"
                  maxLength={15} 
                  className="w-full px-4 py-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  value={formData.phoneNumber} 
                  onChange={handleChange} 
                />
             </div>
          </div>

          {/* Şifre Alanları */}
          <div className="grid grid-cols-1 gap-4">
            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required placeholder="Şifre"
                className="w-full pl-10 pr-10 p-3 border rounded-lg focus:border-red-500 outline-none"
                value={formData.password} onChange={handleChange} 
              />
              <div className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-red-600"
                   onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>

            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                name="confirmPassword" 
                type={showConfirm ? "text" : "password"} 
                required placeholder="Şifre Tekrar"
                className="w-full pl-10 pr-10 p-3 border rounded-lg focus:border-red-500 outline-none"
                value={formData.confirmPassword} onChange={handleChange} 
              />
              <div className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-red-600"
                   onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          {/* Onay Kutucukları */}
          <div className="space-y-3 mt-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="ticariOnay"
                  name="ticariOnay"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                  checked={formData.ticariOnay}
                  onChange={handleChange}
                />
              </div>
              <div className="ml-3 text-xs text-gray-600">
                <label htmlFor="ticariOnay" className="cursor-pointer">
                  Kampanyalardan haberdar olmak için <span className="font-bold underline">Ticari Elektronik İleti Onayı</span> metnini okudum, onaylıyorum. Tarafınızdan gönderilecek ticari elektronik iletileri almak istiyorum.
                </label>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="kvkkOnay"
                  name="kvkkOnay"
                  type="checkbox"
                  required 
                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                  checked={formData.kvkkOnay}
                  onChange={handleChange}
                />
              </div>
              <div className="ml-3 text-xs text-gray-600">
                <label htmlFor="kvkkOnay" className="cursor-pointer">
                  <span className="font-bold underline">KVKK Aydınlatma Metnini</span> okudum, kabul ediyorum.
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-lg mt-6">
            KAYIT OL
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="font-medium text-red-600 hover:underline">
                Giriş Yap
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}

export default RegisterPage;