import { useEffect, useState, useRef } from 'react';
import {
  FaUser, FaHeart, FaSignOutAlt, FaShoppingBag,
  FaTicketAlt, FaArrowLeft, FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaMapMarkerAlt, FaBoxOpen, FaCreditCard
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

function CustomerProfilePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  
  // SİPARİŞ STATE'LERİ
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // Detayı açılan sipariş

  // TICKET STATE'LERİ
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
       navigate("/login");
       return;
    }
    fetchUser(token);
    fetchOrders(token);
    fetchTickets(token);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketMessages]);

  const fetchUser = async (token) => {
    try {
      const res = await api.get("/User/me", { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async (token) => {
    try {
      const res = await api.get("/Order/my-orders", { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (err) { console.log(err); }
  };

  // ✅ SİPARİŞ DETAYINI ÇEKME FONKSİYONU
  const viewOrderDetail = async (orderId) => {
    try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/Order/my-order/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setSelectedOrder(res.data);
    } catch (error) {
        toast.error("Sipariş detayı yüklenemedi.");
    }
  };

  const fetchTickets = async (token) => {
    try {
      const res = await api.get("/Ticket", { headers: { Authorization: `Bearer ${token}` } });
      setTickets(res.data);
    } catch (err) { console.log(err); }
  };

  const viewTicketDetail = async (ticket) => {
    setSelectedTicket(ticket);
    try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/Ticket/${ticket.id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTicketMessages(res.data);
    } catch (error) { toast.error("Mesajlar yüklenemedi."); }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
        const token = localStorage.getItem("token");
        await api.post(`/Ticket/${selectedTicket.id}/reply`, 
            { text: replyText },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const newMessage = { id: Date.now(), sender: "user", text: replyText, date: new Date().toISOString() };
        setTicketMessages([...ticketMessages, newMessage]);
        setReplyText("");
        toast.success("Mesajınız gönderildi.");
    } catch (error) { toast.error("Mesaj gönderilemedi."); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // --- İÇERİK RENDER ---
  const renderContent = () => {
    switch (activeTab) {
      // 1. PROFİL SEKME
      case "profile":
        return (
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Profil Bilgilerim</h2>
            {user ? (
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-500 block">Ad Soyad</span>
                    <span className="font-semibold">{user.fullName}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-500 block">Email</span>
                    <span className="font-semibold">{user.email}</span>
                </div>
                {user.isSeller && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Satıcı Hesabı</span>
                )}
              </div>
            ) : <p>Yükleniyor...</p>}
          </div>
        );

      // 2. SİPARİŞLER SEKME (LİSTE VE DETAY)
      case "orders":
        // A. DETAY GÖRÜNÜMÜ
        if (selectedOrder) {
            return (
                <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <FaArrowLeft className="text-gray-600"/>
                            </button>
                            <div>
                                <h3 className="font-bold text-gray-800">Sipariş #{selectedOrder.id}</h3>
                                <span className="text-xs text-gray-500">
                                    {new Date(selectedOrder.orderDate).toLocaleDateString("tr-TR")}
                                </span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedOrder.orderStatus === 'Teslim Edildi' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {selectedOrder.orderStatus}
                        </span>
                    </div>

                    <div className="p-6 grid gap-6">
                        {/* Ürün Listesi */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><FaBoxOpen className="text-indigo-600"/> Ürünler</h4>
                            <div className="border rounded-lg overflow-hidden">
                                {selectedOrder.orderItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-gray-800">{item.productName}</p>
                                            <p className="text-xs text-gray-500">{item.quantity} adet x {item.price} ₺</p>
                                        </div>
                                        <span className="font-bold text-gray-800">{item.price * item.quantity} ₺</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Adres Bilgileri */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-600"/> Teslimat Adresi</h4>
                                {selectedOrder.shippingAddress ? (
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                                        <p className="font-bold text-gray-800 mb-1">{selectedOrder.shippingAddress.title}</p>
                                        <p>{selectedOrder.shippingAddress.street}</p>
                                        <p>{selectedOrder.shippingAddress.city} / {selectedOrder.shippingAddress.state}</p>
                                        <p>{selectedOrder.shippingAddress.country}</p>
                                    </div>
                                ) : <p className="text-gray-400">Adres bilgisi yok.</p>}
                            </div>

                            {/* Ödeme Özeti */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><FaCreditCard className="text-indigo-600"/> Ödeme Özeti</h4>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ödeme Durumu:</span>
                                        <span className="font-bold text-green-600">{selectedOrder.paymentStatus}</span>
                                    </div>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-800 font-bold text-lg">Toplam Tutar:</span>
                                        <span className="text-indigo-600 font-bold text-xl">{selectedOrder.totalPrice} ₺</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // B. LİSTE GÖRÜNÜMÜ
        return (
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Siparişlerim</h2>
            {orders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                  <FaShoppingBag size={40} className="mx-auto mb-3 opacity-20"/>
                  <p>Henüz siparişiniz bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                  {orders.map((o) => (
                    <div 
                        key={o.id} 
                        onClick={() => viewOrderDetail(o.id)} // TIKLAYINCA DETAYA GİT
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer group bg-white"
                    >
                      <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="font-bold text-gray-800 group-hover:text-indigo-600 transition">Sipariş #{o.id}</span>
                            <span className="text-xs text-gray-500 block mt-1">{new Date(o.orderDate).toLocaleDateString("tr-TR")}</span>
                          </div>
                          <span className="font-bold text-indigo-600 text-lg">{o.totalPrice} ₺</span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              o.orderStatus === 'Teslim Edildi' ? 'bg-green-100 text-green-700' : 
                              o.orderStatus === 'İptal Edildi' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                              {o.orderStatus}
                          </span>
                          <span className="text-xs text-indigo-600 font-semibold group-hover:underline">Detayları Gör &rarr;</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case "favorites":
        return (
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
             <h2 className="text-xl font-bold mb-4 text-gray-800">Favorilerim</h2>
             <p className="text-gray-500">Favori sistemi yakında eklenecek.</p>
          </div>
        );

      case "tickets":
        // --- TICKET DETAY ---
        if (selectedTicket) {
            return (
                <div className="bg-white rounded-xl shadow border border-gray-100 h-[600px] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <FaArrowLeft className="text-gray-600"/>
                            </button>
                            <div>
                                <h3 className="font-bold text-gray-800">{selectedTicket.subject}</h3>
                                <span className="text-xs text-gray-500">#{selectedTicket.id}</span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedTicket.status === 'Açık' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {selectedTicket.status}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
                        <div className="flex justify-end">
                            <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none max-w-[80%] shadow-sm">
                                <p>{selectedTicket.message}</p>
                                <span className="text-[10px] opacity-70 block text-right mt-1">
                                    {new Date(selectedTicket.createdAt).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                        {ticketMessages.map((msg) => {
                            const isAdmin = msg.sender === 'admin';
                            return (
                                <div key={msg.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`p-3 rounded-2xl max-w-[80%] shadow-sm ${
                                        isAdmin 
                                        ? 'bg-white text-gray-800 rounded-bl-none border border-gray-200' 
                                        : 'bg-indigo-600 text-white rounded-br-none'
                                    }`}>
                                        {isAdmin && <span className="text-xs font-bold text-indigo-600 block mb-1">Destek Ekibi</span>}
                                        <p className="text-sm">{msg.text}</p>
                                        <span className={`text-[10px] block text-right mt-1 ${isAdmin ? 'text-gray-400' : 'text-indigo-200'}`}>
                                            {new Date(msg.date).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {selectedTicket.status !== "Kapandı" ? (
                        <div className="p-4 border-t bg-white rounded-b-xl">
                            <div className="flex gap-3">
                                <input 
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                    placeholder="Yanıtınızı yazın..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                />
                                <button onClick={handleSendReply} className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition">
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 border-t bg-gray-100 text-center text-xs text-gray-500 font-bold">Bu talep kapatılmıştır.</div>
                    )}
                </div>
            );
        }

        // --- TICKET LİSTE ---
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Yeni Destek Talebi</h2>
              <div className="space-y-3">
                  <input id="ticket_subject" type="text" placeholder="Konu" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 transition"/>
                  <textarea id="ticket_message" placeholder="Mesajınız..." className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 outline-none focus:border-indigo-500 resize-none transition"></textarea>
                  <div className="flex justify-end">
                      <button
                        onClick={async () => {
                          const subject = document.getElementById("ticket_subject").value.trim();
                          const message = document.getElementById("ticket_message").value.trim();
                          const token = localStorage.getItem("token");
                          if (!subject || !message) { toast.error("Eksik bilgi."); return; }
                          try {
                            await api.post("/Ticket", { subject, message }, { headers: { Authorization: `Bearer ${token}` } });
                            toast.success("Talep oluşturuldu!");
                            fetchTickets(token);
                            document.getElementById("ticket_subject").value = "";
                            document.getElementById("ticket_message").value = "";
                          } catch { toast.error("Hata."); }
                        }}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
                      >Gönder</button>
                  </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Geçmiş Taleplerim</h2>
              {tickets.length === 0 ? <p className="text-gray-500 text-center">Talebiniz yok.</p> : (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} onClick={() => viewTicketDetail(t)} className="border p-4 rounded-xl hover:bg-gray-50 cursor-pointer flex justify-between items-center group transition">
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-indigo-600 transition">{t.subject}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleDateString("tr-TR")}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-bold ${t.status === "Açık" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const MenuItem = ({ icon, text, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 p-3 w-full rounded-lg text-left transition font-medium ${active ? "bg-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
      {icon}<span>{text}</span>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 min-h-[600px]">
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 h-fit space-y-2 sticky top-6">
        <MenuItem icon={<FaUser />} text="Profil" active={activeTab === "profile"} onClick={() => {setActiveTab("profile"); setSelectedTicket(null); setSelectedOrder(null);}} />
        <MenuItem icon={<FaShoppingBag />} text="Siparişlerim" active={activeTab === "orders"} onClick={() => {setActiveTab("orders"); setSelectedTicket(null); setSelectedOrder(null);}} />
        <MenuItem icon={<FaHeart />} text="Favorilerim" active={activeTab === "favorites"} onClick={() => {setActiveTab("favorites"); setSelectedTicket(null); setSelectedOrder(null);}} />
        <MenuItem icon={<FaTicketAlt />} text="Destek Talepleri" active={activeTab === "tickets"} onClick={() => {setActiveTab("tickets"); setSelectedOrder(null);}} />
        <div className="border-t my-2 pt-2"><button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full rounded-lg text-left text-red-600 hover:bg-red-50 font-medium transition"><FaSignOutAlt /> Çıkış Yap</button></div>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}

export default CustomerProfilePage;