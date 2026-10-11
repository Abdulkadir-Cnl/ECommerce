import { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "./api";

// --- COMPONENTS ---
import Navbar from "./Components/Navbar";
import HeroSlider from "./Components/HeroSlider";
import CategoryBar from "./Components/CategoryBar";
import FeaturedProducts from "./Components/FeaturedProducts";
import VideoSection from "./Components/VideoSection";
import CategoryShowcase from "./Components/CategoryShowcase";
import HomeProductList from "./Components/HomeProductList";
import Footer from "./Components/Footer";
import BasketSidebar from "./Components/BasketSidebar";
import CustomPage from "./Components/CustomPage";

// --- PAGES ---
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import BasketPage from "./Pages/BasketPage";
import CheckoutPage from "./Pages/CheckoutPage";
import CustomerProfilePage from "./Pages/CustomerProfilePage";
import AdminProfilePage from "./Pages/AdminProfilePage";
import ProductDetailPage from "./Pages/ProductDetailPage";
import CategoryPage from "./Pages/CategoryPage";
import PaytrPaymentPage from "./Pages/PaytrPaymentPage";

// --- GUARDS ---
const UserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children, requiredRoles }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    const role =
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const roles = Array.isArray(role) ? role : [role];
    if (!requiredRoles.some((r) => roles.includes(r))) {
      return <Navigate to="/" />;
    }
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin");
  const hideFooter =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/basket" ||
    location.pathname === "/checkout" ||
    location.pathname.startsWith("/payment");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productRes, categoryRes, themeRes] = await Promise.all([
          api.get("/Product"),
          api.get("/Category"),
          api.get("/theme/homepage"),
        ]);

        setProducts(productRes.data || []);
        setCategories(categoryRes.data || []);
        setTheme(themeRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <BasketSidebar />
      {!hideNavbar && <Navbar />}

      <div className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* 🔴 DÜZELTME: marqueeText prop'u eklendi */}
                {theme?.showHeroSlider && (
                  <HeroSlider 
                    images={theme.heroSliderImages} 
                    marqueeText={theme.heroMarqueeText} 
                  />
                )}

                <div className="container mx-auto px-2">
                  {theme?.showCategories && (
                    <CategoryBar
                      allCategories={categories}
                      selectedIds={theme.homepageCategoryIds}
                    />
                  )}

                  {theme?.showFeatured && (
                    <FeaturedProducts
                      allProducts={products}
                      selectedIds={theme.featuredProductIds}
                    />
                  )}

                  {theme?.showKitchen && (
                    <VideoSection media={theme.kitchenMedia} />
                  )}

                  {theme?.showShowcase && (
                    <CategoryShowcase
                      allCategories={categories}
                      selectedIds={theme.showcaseCategoryIds}
                    />
                  )}

                  {theme?.showProducts && (
                    <HomeProductList products={products} />
                  )}

                  {theme?.showBottomShowcase && (
                    <CategoryShowcase
                      allCategories={categories}
                      selectedIds={theme.bottomShowcaseCategoryIds}
                    />
                  )}
                </div>
              </>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/basket" element={<BasketPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          <Route
            path="/profile"
            element={
              <UserRoute>
                <CustomerProfilePage />
              </UserRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute requiredRoles={["Admin", "Satıcı"]}>
                <AdminProfilePage />
              </AdminRoute>
            }
          />

          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/sayfa/:slug" element={<CustomPage />} />

          {/* 🔴 PAYTR TEK VE NET SAYFA */}
          <Route path="/payment/paytr" element={<PaytrPaymentPage />} />
        </Routes>
      </div>

      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;