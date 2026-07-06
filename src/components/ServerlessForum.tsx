import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Hash, User, Send, Search } from 'lucide-react';
import { p2p } from '@/lib/p2p';
import { storage } from '@/lib/storage';
import { ForumTopic, ForumMessage } from '@/types';
import { clsx } from 'clsx';

const ServerlessForum: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>(storage.get('forum_topics', [
    { id: '1', title: 'Galatasaray - Fenerbahçe Derbi Tahminleri', author: 'Aslan_1905', category: 'Süper Lig', replies: 156, timestamp: Date.now() - 3600000 },
    { id: '2', title: 'EuroLeague Playoff Eşleşmeleri Hakkında', author: 'BasketSever', category: 'Basketbol', replies: 42, timestamp: Date.now() - 86400000 },
    { id: '3', title: 'Yeni Transfer Dedikoduları - Canlı Blog', author: 'MuhabirCan', category: 'Transferler', replies: 890, timestamp: Date.now() - 5000 },
  ]));
  const [messages, setMessages] = useState<ForumMessage[]>(storage.get('forum_messages', []));
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => { storage.set('forum_topics', topics); }, [topics]);
  useEffect(() => { storage.set('forum_messages', messages); }, [messages]);

  useEffect(() => {
    const unsub = p2p.subscribe((msg) => {
      if (msg.type === 'NEW_TOPIC') { setTopics(prev => [msg.payload, ...prev]); }
      else if (msg.type === 'NEW_MESSAGE') { setMessages(prev => [...prev, msg.payload]); }
    });
    return () => { unsub(); };
  }, [selectedTopic]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTopic) return;
    const message: ForumMessage = {
      id: Math.random().toString(36).substring(7),
      topicId: selectedTopic.id,
      author: storage.get('username', 'Taraftar627'),
      content: newMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, message]);
    p2p.broadcast('NEW_MESSAGE', message);
    setNewMessage('');
  };

  const currentMessages = messages.filter(m => m.topicId === selectedTopic?.id);

  return (
    <div className="flex h-full bg-background">
      <aside className="w-full lg:w-96 border-r border-white/5 flex flex-col bg-background-inner">
        <div className="p-6 border-b border-white/5 space-y-4">
           <div className="flex items-center justify-between"><h2 className="text-xs font-black tracking-widest text-white/40 uppercase">Forum Konuları</h2><button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-black transition-all"><Plus size={20} /></button></div>
           <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" /><input type="text" placeholder="Konu ara..." className="w-full bg-background border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-primary/50 outline-none transition-all" /></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {topics.map(topic => (
            <button key={topic.id} onClick={() => setSelectedTopic(topic)} className={clsx("w-full p-6 text-left border-b border-white/5 transition-all group", selectedTopic?.id === topic.id ? "bg-primary/5 border-r-2 border-r-primary" : "hover:bg-white/5")}>
              <div className="flex items-center gap-2 mb-2"><span className="text-[10px] font-black uppercase text-primary/60 tracking-widest px-2 py-0.5 bg-primary/5 rounded">{topic.category}</span><span className="text-white/20 font-bold">•</span><span className="text-[10px] text-white/20 font-bold">{new Date(topic.timestamp).toLocaleDateString()}</span></div>
              <h3 className={clsx("font-bold text-sm mb-3 group-hover:text-primary transition-colors", selectedTopic?.id === topic.id ? "text-white" : "text-white/70")}>{topic.title}</h3>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[8px] font-black">{topic.author[0]}</div><span className="text-[10px] font-bold text-white/40">{topic.author}</span></div><div className="flex items-center gap-1.5 text-white/20"><MessageSquare size={12} /><span className="text-[10px] font-black">{topic.replies}</span></div></div>
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {selectedTopic ? (
          <>
            <div className="p-8 border-b border-white/5 bg-background-inner/50 backdrop-blur-xl"><div className="flex items-center gap-2 mb-2"><Hash className="text-primary" size={16} /><span className="text-xs font-black text-primary/60 tracking-widest uppercase">{selectedTopic.category}</span></div><h1 className="text-2xl font-black tracking-tight">{selectedTopic.title}</h1></div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="flex gap-6"><div className="flex flex-col items-center gap-2"><div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><User size={24} /></div><div className="h-full w-px bg-white/5" /></div><div className="flex-1 space-y-4"><div className="flex items-center gap-3"><span className="font-black text-sm">{selectedTopic.author}</span><span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">KONU SAHİBİ</span><span className="text-[10px] text-white/10">{new Date(selectedTopic.timestamp).toLocaleString()}</span></div><p className="text-white/70 leading-relaxed text-sm">Tahminleriniz neler?</p></div></div>
               {currentMessages.map(msg => ( <div key={msg.id} className="flex gap-6 animate-in slide-in-from-bottom-4 duration-500"><div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20"><User size={24} /></div><div className="flex-1 space-y-3"><div className="flex items-center gap-3"><span className="font-bold text-sm">{msg.author}</span><span className="text-[10px] text-white/10">{new Date(msg.timestamp).toLocaleTimeString()}</span></div><div className="bg-background-card border border-white/5 p-4 rounded-2xl rounded-tl-none"><p className="text-sm text-white/80 leading-relaxed">{msg.content}</p></div></div></div> ))}
            </div>
            <div className="p-8 border-t border-white/5 bg-background-inner/30 backdrop-blur-xl"><div className="flex items-center gap-4"><div className="flex-1 bg-background border border-white/10 rounded-2xl flex items-center px-6 h-14 focus-within:border-primary/40 transition-all"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Düşüncelerinizi paylaşın..." className="bg-transparent border-none outline-none flex-1 text-sm font-medium" /></div><button onClick={handleSendMessage} className="w-14 h-14 bg-primary text-black rounded-2xl flex items-center justify-center hover:bg-primary-hover transition-all hover:scale-105 active:scale-95"><Send size={24} /></button></div></div>
          </>
        ) : ( <div className="flex-1 flex flex-col items-center justify-center text-center p-10"><div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-white/10"><MessageSquare size={48} /></div><h2 className="text-2xl font-black tracking-tight mb-2 uppercase">Sohbete Katıl</h2><p className="text-white/40 text-sm max-w-xs leading-relaxed">Soldaki listeden bir konu seçin.</p></div> )}
      </main>
    </div>
  );
};

export default ServerlessForum;
