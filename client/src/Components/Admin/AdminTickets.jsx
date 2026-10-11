// src/Components/Admin/AdminTickets.jsx

import { useState, useEffect } from 'react';
import { FaSearch, FaHeadset, FaCircle, FaTicketAlt } from 'react-icons/fa';
import api from '../../api';
import AdminTicketDetail from './AdminTicketDetail';

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem("token");
        // DÜZELTME BURADA: '/Ticket' yerine '/Ticket/admin' kullanıldı.
        const res = await api.get('/Ticket/admin', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data);
    } catch (e) {
        console.error("Ticketlar çekilemedi", e);
    } finally {
        setLoading(false);
    }
  };

  // Backend'den gelen status 'Açık' veya 'Kapandı' string'i olabilir.
  const getStatusBadge = (status) => {
      if (status === 'Açık') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                <FaCircle size={6} className="animate-pulse"/> Açık
            </span>
          );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
            <FaCircle size={6}/> Kapandı
        </span>
      );
  };

  if (selectedTicket) {
      return (
        <AdminTicketDetail 
            ticket={selectedTicket} 
            onBack={() => { 
                setSelectedTicket(null); 
                fetchTickets(); // Geri dönünce listeyi yenile (durum değişmiş olabilir)
            }} 
        />
      );
  }

  return (
    <div className="animate-fade-in flex flex-col h-full p-6">
        <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Destek Talepleri</h2>
                <FaHeadset className="text-gray-400 text-sm"/>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-bold border ${filter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600'}`}>Tümü</button>
                <button onClick={() => setFilter('open')} className={`px-4 py-2 rounded-lg text-sm font-bold border ${filter === 'open' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600'}`}>Açık</button>
            </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Arama Alanı */}
            <div className="p-4 border-b border-gray-200 bg-white shrink-0">
                <div className="relative w-full md:w-96">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="text" placeholder="Talep no veya konu ara..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500"/>
                </div>
            </div>

            <div className="overflow-auto flex-1">
                {loading ? (
                    <div className="flex justify-center items-center h-40 text-gray-500">Yükleniyor...</div>
                ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <FaTicketAlt size={40} className="mb-4 opacity-20"/>
                        <p>Henüz destek talebi yok.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                                <th className="p-4 w-20">ID</th>
                                <th className="p-4">Konu</th>
                                <th className="p-4">Mesaj Özeti</th>
                                <th className="p-4">Durum</th>
                                <th className="p-4 text-right">Tarih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {tickets
                                .filter(t => filter === 'all' || (filter === 'open' ? t.status === 'Açık' : t.status === 'Kapandı'))
                                .map((ticket) => (
                                <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <td className="p-4 font-mono text-gray-500">#{ticket.id}</td>
                                    <td className="p-4 font-bold text-gray-900 group-hover:text-indigo-600">{ticket.subject}</td>
                                    <td className="p-4 text-gray-500 truncate max-w-xs">{ticket.message}</td>
                                    <td className="p-4">{getStatusBadge(ticket.status)}</td>
                                    <td className="p-4 text-right text-gray-500">
                                        {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    </div>
  );
}

export default AdminTickets;