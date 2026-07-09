import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { p2p } from '@/lib/p2p';
import { User, Smartphone, Upload, Download, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

const ACCOUNT_KEY = 'account';

function encodePayload(obj: any) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function decodePayload(s: string) {
  try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch { return null; }
}

const Account: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [account, setAccount] = useState<any>(
    storage.get(ACCOUNT_KEY, { username: 'Taraftar627', favoriteTeam: 'Galatasaray', createdAt: Date.now() })
  );
  const [pin, setPin] = useState('');
  const [incoming, setIncoming] = useState<any | null>(null);
  const [sharedCode, setSharedCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    const unsub = p2p.subscribe((msg) => {
      if (msg.type === 'ACCOUNT_OFFER') {
        setIncoming(msg.payload);
      } else if (msg.type === 'ACCOUNT_SYNC_REQUEST' && msg.senderId !== p2p.getSenderId()) {
        // Send our current account as sync offer
        p2p.broadcast('ACCOUNT_SYNC_RESPONSE', {
          targetId: msg.senderId,
          payload: encodePayload(account)
        });
      } else if (msg.type === 'ACCOUNT_SYNC_RESPONSE' && msg.payload.targetId === p2p.getSenderId()) {
        const decoded = decodePayload(msg.payload.payload);
        if (decoded) {
          setIncoming(msg.payload.payload);
          setSyncStatus('Ağdaki cihaz bulundu! Kabul edebilirsiniz.');
        }
      }
    });
    return () => { unsub(); };
  }, [account]);

  const save = () => {
    const toSave = { ...account, updatedAt: Date.now() };
    storage.set(ACCOUNT_KEY, toSave);
    storage.set('username', toSave.username);
    setAccount(toSave);
    p2p.broadcast('USER_UPDATE', { username: toSave.username });
    if (onClose) onClose();
  };

  const exportAccount = () => {
    const payload = encodePayload(account);
    setSharedCode(payload);
  };

  const importAccount = () => {
    const decoded = decodePayload(pin);
    if (!decoded) return alert('Geçersiz kod');
    storage.set(ACCOUNT_KEY, decoded);
    storage.set('username', decoded.username);
    setAccount(decoded);
    p2p.broadcast('USER_UPDATE', { username: decoded.username });
    alert('Hesap başarıyla içe aktarıldı.');
  };

  const sendOffer = () => {
    const payload = encodePayload(account);
    p2p.broadcast('ACCOUNT_OFFER', payload);
    alert('Hesap teklifi yerel P2P ağına yayınlandı!');
  };

  const triggerNetworkSync = () => {
    setIsSyncing(true);
    setSyncStatus('Yerel ağdaki diğer cihazlar aranıyor...');
    p2p.broadcast('ACCOUNT_SYNC_REQUEST', {});
    setTimeout(() => {
      setIsSyncing(false);
    }, 4000);
  };

  const acceptIncoming = () => {
    if (!incoming) return;
    const decoded = decodePayload(incoming);
    if (!decoded) return alert('Geçersiz gelen hesap');
    storage.set(ACCOUNT_KEY, decoded);
    storage.set('username', decoded.username);
    setAccount(decoded);
    p2p.broadcast('USER_UPDATE', { username: decoded.username });
    setIncoming(null);
    setSyncStatus('');
    alert('Hesap alındı ve yerel depolama alanı güncellendi!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
      <div className="absolute inset-0" onClick={() => onClose && onClose()} />
      <div className="relative w-full max-w-2xl bg-background-card border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-black shadow-[0_0_20px_rgba(132,204,22,0.3)]">
            <User size={28} />
          </div>
          <div>
            <h3 className="font-black text-xl uppercase tracking-tight">HESAP AKTARIMI & SENKRONİZASYON</h3>
            <p className="text-white/40 text-sm mt-0.5">Hiçbir merkezi sunucu olmadan, cihazlarınız arasında anında profil paylaşımı yapın.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-primary tracking-widest">Kullanıcı Adı</label>
              <input
                value={account.username}
                onChange={(e) => setAccount({ ...account, username: e.target.value })}
                className="mt-2 w-full p-3.5 rounded-xl bg-background-inner border border-white/10 text-white font-semibold focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Favori Takım</label>
              <select
                value={account.favoriteTeam || 'Galatasaray'}
                onChange={(e) => setAccount({ ...account, favoriteTeam: e.target.value })}
                className="mt-2 w-full p-3.5 rounded-xl bg-background-inner border border-white/10 text-white font-semibold focus:border-primary/50 outline-none transition-all"
              >
                <option value="Galatasaray">Galatasaray</option>
                <option value="Fenerbahçe">Fenerbahçe</option>
                <option value="Beşiktaş">Beşiktaş</option>
                <option value="Trabzonspor">Trabzonspor</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">PIN / Dışa Aktarma Kodu</label>
              <textarea
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Buraya kopyalanan kodu yapıştırarak diğer cihazın profilini yükleyin..."
                className="mt-2 w-full h-[122px] p-3.5 rounded-xl bg-background-inner border border-white/10 text-xs font-mono text-white/70 focus:border-primary/50 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-8 border-t border-white/5 pt-6">
          <button onClick={save} className="px-6 py-3 bg-primary text-black font-black rounded-xl hover:bg-primary-hover text-xs tracking-widest transition-all">KAYDET</button>
          <button onClick={exportAccount} className="px-5 py-3 border border-white/10 rounded-xl text-white/80 font-bold hover:bg-white/5 text-xs tracking-widest transition-all flex items-center gap-2"><Upload size={14}/> KOD ÜRET</button>
          <button onClick={importAccount} className="px-5 py-3 border border-white/10 rounded-xl text-white/80 font-bold hover:bg-white/5 text-xs tracking-widest transition-all flex items-center gap-2"><Download size={14}/> KODLA YÜKLE</button>
          <button onClick={sendOffer} className="md:ml-auto px-5 py-3 bg-primary/10 border border-primary/20 text-primary rounded-xl font-bold hover:bg-primary hover:text-black text-xs tracking-widest transition-all flex items-center gap-2"><Smartphone size={14}/> LAN PAYLAŞ</button>
        </div>

        {sharedCode && (
          <div className="mt-6 p-4 bg-background-inner border border-white/10 rounded-2xl">
            <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">DIŞA AKTARMA KODU (KOPYALAYIN)</div>
            <div className="font-mono text-[11px] break-all text-white/60 select-all max-h-24 overflow-y-auto pr-2">{sharedCode}</div>
          </div>
        )}

        {isSyncing && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4 animate-pulse">
            <RefreshCw className="animate-spin text-primary" size={20} />
            <div className="text-sm font-semibold">{syncStatus}</div>
          </div>
        )}

        {incoming && (
          <div className="mt-6 p-5 border border-primary/20 rounded-2xl bg-primary/5 shadow-inner">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs font-black text-primary tracking-widest uppercase mb-1 flex items-center gap-1.5"><ShieldCheck size={14} /> GELEN HESAP AKTARIMI</div>
                <div className="text-[11px] text-white/60">Ağ üzerinden yeni bir profil tespit edildi. Onaylarsanız bu profil yerel cihazınıza kaydedilecektir.</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setIncoming(null); setSyncStatus(''); }} className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5">YOKSAY</button>
                <button onClick={acceptIncoming} className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs tracking-widest">KABUL ET</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30 border-t border-white/5 pt-6">
          <span>P2P DURUMU: AKTİF</span>
          <button onClick={triggerNetworkSync} className="text-primary hover:underline flex items-center gap-1"><RefreshCw size={10} /> LAN CIHAZLARINI TARA</button>
        </div>
      </div>
    </div>
  );
};

export default Account;
