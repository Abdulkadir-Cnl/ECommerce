// src/Components/Admin/AdminTicketDetail.jsx

import { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPaperPlane, FaTimesCircle, FaUser, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api';

function AdminTicketDetail({ ticket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState(ticket.status);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [ticket.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/Ticket/${ticket.id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (e) {
      console.error("Mesajlar çekilemedi", e);
      toast.error("Mesaj geçmişi yüklenirken hata oluştu.");
    }
  };

  const handleSend = async () => {
    if (!reply.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await api.post(`/Ticket/${ticket.id}/reply`, 
        { text: reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Mesajı listeye manuel ekle (veya fetchMessages'ı tekrar çağır)
      const newMsg = { 
        id: Date.now(), 
        sender: 'admin', 
        text: reply, 
        createdAt: new Date().toISOString() // Backend 'createdAt' dönüyor olabilir, kontrol et
      };
      
      setMessages([...messages, newMsg]);
      setReply('');
      toast.success("Cevap gönderildi.");
      
      // Garanti olması için mesajları sunucudan tekrar çekebiliriz
      setTimeout(fetchMessages, 500);

    } catch (err) {
      console.error(err);
      toast.error("Mesaj gönderilemedi.");
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm("Bu talebi kapatmak istiyor musunuz?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.put(`/Ticket/${ticket.id}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('Kapandı');
      toast.success("Talep kapatıldı.");
    } catch {
      toast.error("İşlem başarısız.");
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-full bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition">
            <FaArrowLeft className="text-gray-600" />
          </button>

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              #{ticket.id} - {ticket.subject}
            </h2>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <FaUser /> {ticket.customer || "Müşteri"}
              <span className="text-gray-300">|</span>
              <FaClock /> {new Date(ticket.createdAt).toLocaleDateString("tr-TR")}
            </div>
          </div>
        </div>

        {status !== 'Kapandı' ? (
          <button
            onClick={handleCloseTicket}
            className="px-4 py-2 border border-red-300 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-2 font-bold text-sm"
          >
            <FaTimesCircle /> Talebi Kapat
          </button>
        ) : (
            <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm font-bold">Kapandı</span>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f0f2f5]">
        {messages.map(msg => {
          const isAdmin = msg.sender === "admin";
          return (
            <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm border 
                ${isAdmin ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`}>
                
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`text-[10px] mt-2 text-right ${isAdmin ? "text-indigo-200" : "text-gray-400"}`}>
                  {new Date(msg.date || msg.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">Henüz mesaj yok.</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      {status !== "Kapandı" ? (
        <div className="p-4 bg-white border-t">
          <div className="flex gap-4 items-end max-w-4xl mx-auto">
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Yanıtınızı yazın..."
              className="flex-1 border rounded-xl p-3 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                  }
              }}
            />

            <button
              onClick={handleSend}
              className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition shadow-lg"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-100 text-center text-gray-500 font-bold border-t">
            Bu talep kapatılmıştır, yanıt verilemez.
        </div>
      )}
    </div>
  );
}

export default AdminTicketDetail;