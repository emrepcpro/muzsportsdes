import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { p2p } from '@/lib/p2p';
import { User, Smartphone, Upload, Download } from 'lucide-react';

const ACCOUNT_KEY = 'account';

function encodePayload(obj: any) {
  return btoa(JSON.stringify(obj));
}

function decodePayload(s: string) {
  try { return JSON.parse(atob(s)); } catch { return null; }
}

const Account: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [account, setAccount] = useState<any>(storage.get(ACCOUNT_KEY, { username: '', createdAt: Date.now() }));
  const [pin, setPin] = useState('');
  const [incoming, setIncoming] = useState<any | null>(null);
  const [sharedCode, setSharedCode] = useState('');

  useEffect(() => {
    const unsub: any = p2p.subscribe((msg) => {
      if (msg.type === 'ACCOUNT_OFFER') {
        // show incoming offer
        setIncoming(msg.payload);
      }
    });
    return () => { unsub(); };
  }, []);

  const save = () => {
    const toSave = { ...account, updatedAt: Date.now() };
    storage.set(ACCOUNT_KEY, toSave);
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
    setAccount(decoded);
    p2p.broadcast('USER_UPDATE', { username: decoded.username });
    alert('Hesap içe aktarıldı');
  };

  const sendOffer = () => {
    const payload = encodePayload(account);
    p2p.broadcast('ACCOUNT_OFFER', payload);
    alert('Hesap teklifi gönderildi (aynı ağdaki sekmelere)');
  };

  const acceptIncoming = () => {
    if (!incoming) return;
    const decoded = decodePayload(incoming);
    if (!decoded) return alert('Geçersiz gelen hesap');
    storage.set(ACCOUNT_KEY, decoded);
    setAccount(decoded);
    p2p.broadcast('USER_UPDATE', { username: decoded.username });
    setIncoming(null);
    alert('Hesap alındı ve yerel depoya kaydedildi');
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60" onClick={() => onClose && onClose()} />
      <div className="relative w-full max-w-2xl bg-background-card border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-black"><User size={24} /></div>
          <div>
            <h3 className="font-black text-lg">Hesap & Taşıma</h3>
            <p className="text-white/40 text-sm">Hesabınızı yönetin, dışa aktarın veya başka bir cihaz/sekme ile paylaşın.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-white/40">Kullanıcı Adı</label>
            <input value={account.username} onChange={(e) => setAccount({ ...account, username: e.target.value })} className="mt-2 w-full p-3 rounded-xl bg-background-inner border border-white/5" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-white/40">PIN (içe aktarma için)</label>
            <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Buraya dışa aktarma kodunu yapıştırın" className="mt-2 w-full p-3 rounded-xl bg-background-inner border border-white/5" />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={save} className="px-4 py-2 bg-primary text-black font-bold rounded-lg">Kaydet</button>
          <button onClick={exportAccount} className="px-4 py-2 border border-white/5 rounded-lg text-white/80 flex items-center gap-2"><Upload size={14}/> Dışa Aktar</button>
          <button onClick={importAccount} className="px-4 py-2 border border-white/5 rounded-lg text-white/80 flex items-center gap-2"><Download size={14}/> İçe Aktar</button>
          <button onClick={sendOffer} className="ml-auto px-4 py-2 bg-primary/90 text-black rounded-lg flex items-center gap-2"><Smartphone size={14}/> Gönder (P2P)</button>
        </div>

        {sharedCode && (
          <div className="mt-4 p-3 bg-white/5 rounded-md font-mono text-xs break-all">{sharedCode}</div>
        )}

        {incoming && (
          <div className="mt-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black">Gelen Hesap Teklifi</div>
                <div className="text-[10px] text-white/40 mt-1">Bir sekmeden hesap paylaşımı önerildi. Kabul ederseniz yerel hesaba kaydedilecek.</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIncoming(null)} className="px-3 py-1 rounded-lg border border-white/5">Reddet</button>
                <button onClick={acceptIncoming} className="px-3 py-1 rounded-lg bg-primary text-black font-bold">Kabul Et</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
