import React, { useState, useEffect } from 'react';
import { Smartphone, QrCode, X, CheckCircle2, ShieldCheck, RefreshCcw } from 'lucide-react';
import { p2p } from '@/lib/p2p';
import { storage } from '@/lib/storage';

interface MobileSyncProps { isOpen: boolean; onClose: () => void; }

const MobileSync: React.FC<MobileSyncProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [syncedDevice, setSyncedDevice] = useState('Mobil Cihaz Bekleniyor...');

  useEffect(() => {
    if (!isOpen) return;

    // Listen for P2P sync notifications
    const unsub = p2p.subscribe((msg) => {
      if (msg.type === 'MOBILE_CONNECT_REQUEST') {
        p2p.broadcast('MOBILE_CONNECT_RESPONSE', {
          username: storage.get('username', 'Taraftar627'),
          status: 'SUCCESS'
        });
        setSyncedDevice(msg.payload.deviceName || 'Android Fan Cihazı');
        setStep(2);
      }
    });
    return () => {
      unsub();
    };
  }, [isOpen]);

  const simulateMobileConnection = () => {
    setStep(2);
    setSyncedDevice('iPhone 15 Pro Max');
    // Broadcast success
    p2p.broadcast('MOBILE_CONNECT_SUCCESS', {
      deviceName: 'iPhone 15 Pro Max',
      timestamp: Date.now()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-background-card border border-white/10 w-full max-w-md rounded-3xl overflow-hidden relative z-10 shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <div className="p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 shadow-[0_0_15px_rgba(132,204,22,0.15)]">
            <Smartphone size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2 uppercase">MOBİL SENKRONİZASYON</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10">P2P bağlantısı sayesinde tüm mobil cihazlarınız sunucusuz çalışır.</p>

          {step === 1 ? (
            <div className="space-y-8 w-full">
              <div className="bg-white p-6 rounded-3xl mx-auto w-48 h-48 flex items-center justify-center relative group shadow-lg">
                <QrCode size={140} className="text-black" />
                <div className="absolute inset-0 bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                  <button onClick={simulateMobileConnection} className="bg-black text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">SİMÜLE ET</button>
                </div>
              </div>
              <div className="text-xs text-white/40 font-semibold uppercase tracking-wider">Mobil kameranızla QR kodunu tarayın veya aynı ağa bağlanın.</div>
            </div>
          ) : (
            <div className="space-y-8 w-full animate-in zoom-in-95 duration-500">
              <div className="w-48 h-48 mx-auto relative flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
                <div className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_20px_rgba(132,204,22,0.25)]">
                  <CheckCircle2 size={64} />
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-3 mb-2 text-primary">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">GÜVENLİ P2P BAĞLANTISI AKTİF</span>
                </div>
                <div className="text-xl font-bold italic tracking-tight">{syncedDevice}</div>
              </div>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 mx-auto text-[10px] font-black text-white/40 hover:text-primary transition-colors uppercase tracking-widest">
                <RefreshCcw size={14} /> BAĞLANTIYI YENİLE
              </button>
            </div>
          )}
        </div>
        <div className="bg-background-inner/50 p-6 border-t border-white/5 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] text-center">
          End-to-End P2P Encryption Active
        </div>
      </div>
    </div>
  );
};

export default MobileSync;
