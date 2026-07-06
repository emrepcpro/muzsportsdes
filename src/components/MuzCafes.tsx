import React, { useState, useRef, useEffect } from 'react';
import { Coffee, Tv, Camera, Mic, Share2, Heart, X, Send } from 'lucide-react';
import { p2p } from '@/lib/p2p';
import { clsx } from 'clsx';

const MuzCafes: React.FC = () => {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; text: string }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#84cc16');

  const rooms = [
    { id: '1', name: 'Dev Derbi Odası', participants: 42, active: true },
    { id: '2', name: 'Taktik Tahtası - Galatasaray', participants: 12, active: true },
    { id: '3', name: 'EuroLeague Final Four Sohbet', participants: 85, active: true },
  ];

  // P2P Subscribers for incoming data
  useEffect(() => {
    const unsub = p2p.subscribe((msg) => {
      if (msg.type === 'CANVAS_DRAW' && msg.payload.roomId === activeRoom && msg.senderId !== p2p.getSenderId()) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = msg.payload.color;
          ctx.lineTo(msg.payload.x, msg.payload.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(msg.payload.x, msg.payload.y);
        }
      } else if (msg.type === 'REACTION' && msg.payload.roomId === activeRoom) {
        const id = Date.now();
        setReactions(prev => [...prev, { id, text: msg.payload.text }]);
        setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
      }
    });
    return () => { unsub(); };
  }, [activeRoom]);

  // Handle Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (isCameraOn) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } else {
          if (videoRef.current) videoRef.current.srcObject = null;
        }
      } catch (err) {
        console.error("Camera access denied", err);
        setIsCameraOn(false);
      }
    };
    startCamera();
    return () => { stream?.getTracks().forEach(track => track.stop()); };
  }, [isCameraOn]);

  // Handle Screen Share
  const toggleScreenShare = async () => {
    try {
      if (!isSharingScreen) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsSharingScreen(true);
        stream.getVideoTracks()[0].onended = () => setIsSharingScreen(false);
      } else {
        setIsSharingScreen(false);
        if (isCameraOn) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } else {
            if (videoRef.current) videoRef.current.srcObject = null;
        }
      }
    } catch (err) {
      console.error("Screen share failed", err);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !activeRoom) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  }, [brushColor, activeRoom]);

  const startDrawing = (e: React.MouseEvent) => { setIsDrawing(true); draw(e); };
  const stopDrawing = () => setIsDrawing(false);
  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    p2p.broadcast('CANVAS_DRAW', { x, y, color: brushColor, roomId: activeRoom });
  };

  const triggerReaction = (text: string) => {
    p2p.broadcast('REACTION', { text, roomId: activeRoom });
    // Local trigger
    const id = Date.now();
    setReactions(prev => [...prev, { id, text }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
  };

  if (!activeRoom) {
    return (
      <div className="p-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-gradient">MUZ CAFES</h1>
            <p className="text-white/40 font-medium mt-1 uppercase text-[10px] tracking-widest">P2P Canlı İzleme & Sohbet Odaları</p>
          </div>
          <button className="bg-primary text-black font-black px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors text-xs tracking-widest">
            YENİ ODA OLUŞTUR
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="glass-panel group hover:border-primary/50 transition-all p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                  <Coffee className="text-white/40 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-center gap-2 bg-background-inner px-3 py-1 rounded-full border border-white/5">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   <span className="text-[10px] font-bold text-white/50">{room.participants} Kişi</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">{room.name}</h3>
                <p className="text-xs text-white/40 mt-1">Sunucusuz P2P Bağlantı</p>
              </div>
              <button onClick={() => setActiveRoom(room.id)} className="w-full py-3 rounded-lg border border-white/10 font-bold text-xs tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all">
                ODAYA KATIL
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-background">
      <div className="w-full lg:w-96 border-r border-white/5 flex flex-col bg-background-inner overflow-y-auto">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <button onClick={() => setActiveRoom(null)} className="text-white/40 hover:text-white"><X size={20}/></button>
          <div className="text-[10px] font-black tracking-widest text-primary uppercase">ODA: {rooms.find(r => r.id === activeRoom)?.name}</div>
          <div className="w-5" />
        </div>
        <div className="p-6 space-y-4">
          <div className="aspect-video rounded-xl bg-background border border-white/10 relative overflow-hidden flex items-center justify-center bg-black">
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
             {!isCameraOn && !isSharingScreen && <Camera className="absolute text-white/10" size={40} />}
             <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
               {isSharingScreen ? 'EKRANIN' : 'KAMERAN'}
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => setIsCameraOn(!isCameraOn)} className={clsx("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", isCameraOn ? "bg-primary border-primary text-black" : "bg-white/5 border-white/10 text-white/60")}><Camera size={20} /><span className="text-[10px] font-bold">KAMERA</span></button>
             <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/60 flex flex-col items-center gap-2"><Mic size={20} /><span className="text-[10px] font-bold">MİKROFON</span></button>
          </div>
          <div className="pt-6 border-t border-white/5">
             <h4 className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-4">KATILIMCILAR (P2P)</h4>
             <div className="space-y-3">
               {[1,2,3].map(i => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">P{i}</div>
                   <div className="flex-1"><div className="text-xs font-bold">User_{i * 123}</div><div className="text-[8px] text-primary font-black uppercase">BAĞLI</div></div>
                   <div className="flex gap-1"><div className="w-1 h-3 bg-primary/20 rounded-full" /><div className="w-1 h-2 bg-primary rounded-full" /><div className="w-1 h-4 bg-primary/40 rounded-full" /></div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
      <div className="flex-1 relative flex flex-col">
        <div className="flex-1 bg-background-inner relative flex items-center justify-center overflow-hidden">
           <div className="w-[90%] aspect-[16/9] bg-[#1a1a1a] rounded-3xl border-4 border-white/5 relative shadow-2xl overflow-hidden">
              <div className="absolute inset-4 border border-white/5 rounded-2xl flex items-center justify-center"><div className="w-px h-full bg-white/5" /><div className="w-32 h-32 rounded-full border border-white/5" /></div>

              {/* This could show the host's screen share in a real app context */}
              {isSharingScreen && <div className="absolute inset-0 bg-primary/5 flex items-center justify-center"><Tv size={80} className="text-primary opacity-20" /></div>}

              <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseMove={draw} onMouseLeave={stopDrawing} width={1200} height={675} className="absolute inset-0 w-full h-full cursor-crosshair z-10" />

              <div className="absolute inset-0 pointer-events-none z-30">
                {reactions.map(r => (
                  <div key={r.id} className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce bg-primary text-black px-6 py-3 rounded-full font-black text-2xl shadow-2xl">
                    {r.text}
                  </div>
                ))}
              </div>
           </div>
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl z-40">
              <button onClick={toggleScreenShare} className={clsx("p-4 rounded-xl transition-all", isSharingScreen ? "bg-primary text-black" : "bg-white/5 hover:bg-white/10")}><Tv size={24} /></button>
              <div className="w-px h-10 bg-white/10 mx-2" />
              <button onClick={() => setBrushColor('#84cc16')} className={clsx("w-8 h-8 rounded-full bg-primary border-2", brushColor === '#84cc16' ? "border-white" : "border-transparent")} />
              <button onClick={() => setBrushColor('#ef4444')} className={clsx("w-8 h-8 rounded-full bg-red-500 border-2", brushColor === '#ef4444' ? "border-white" : "border-transparent")} />
              <button onClick={() => setBrushColor('#3b82f6')} className={clsx("w-8 h-8 rounded-full bg-blue-500 border-2", brushColor === '#3b82f6' ? "border-white" : "border-transparent")} />
              <div className="w-px h-10 bg-white/10 mx-2" />
              <button onClick={() => triggerReaction('GOL!')} className="px-4 py-2 bg-white/5 rounded-lg hover:bg-primary hover:text-black font-black text-[10px] transition-all">GOL!</button>
              <button onClick={() => triggerReaction('WOW!')} className="px-4 py-2 bg-white/5 rounded-lg hover:bg-primary hover:text-black font-black text-[10px] transition-all">WOW!</button>
              <button onClick={() => triggerReaction('🔥🔥')} className="px-4 py-2 bg-white/5 rounded-lg hover:bg-primary hover:text-black font-black text-[10px] transition-all">🔥🔥</button>
           </div>
        </div>
        <div className="h-20 border-t border-white/5 bg-background-inner flex items-center px-6 gap-4">
           <div className="flex-1 bg-background border border-white/10 rounded-xl flex items-center px-4 h-12"><input type="text" placeholder="Mesajınızı yazın..." className="bg-transparent border-none outline-none flex-1 text-sm font-medium" /><div className="flex gap-2"><button className="text-white/40 hover:text-white"><Heart size={18} /></button><button className="text-white/40 hover:text-white"><Share2 size={18} /></button></div></div>
           <button className="w-12 h-12 bg-primary text-black rounded-xl flex items-center justify-center hover:bg-primary-hover transition-colors"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
};

export default MuzCafes;
