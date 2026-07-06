import React, { useState, useRef, useEffect } from 'react';
import { Coffee, Tv, Camera, Mic, Share2, Heart, X, Send, Users, ShieldCheck, Zap } from 'lucide-react';
import { p2p } from '@/lib/p2p';
import { clsx } from 'clsx';

const MuzCafes: React.FC = () => {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#84cc16');

  const rooms = [
    { id: '1', name: 'DEV DERBİ STADYUMU', participants: 1284, active: true },
    { id: '2', name: 'GALATASARAY TAKTİK ANALİZ', participants: 452, active: true },
    { id: '3', name: 'FENERBAHÇE CANLI SOHBET', participants: 890, active: true },
  ];

  useEffect(() => {
    const unsub = p2p.subscribe((msg) => {
      if (msg.type === 'CANVAS_DRAW' && msg.payload.roomId === activeRoom && msg.senderId !== p2p.getSenderId()) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = msg.payload.color;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineTo(msg.payload.x, msg.payload.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(msg.payload.x, msg.payload.y);
        }
      } else if (msg.type === 'REACTION' && msg.payload.roomId === activeRoom) {
        const id = Date.now();
        const x = Math.random() * 80 + 10;
        const y = Math.random() * 80 + 10;
        setReactions(prev => [...prev, { id, text: msg.payload.text, x, y }]);
        setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
      } else if (msg.type === 'CINEMA_TOGGLE' && msg.payload.roomId === activeRoom) {
        setIsCinemaMode(msg.payload.enabled);
      }
    });
    return () => { unsub(); };
  }, [activeRoom]);

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
    } catch (err) { console.error("Screen share failed", err); }
  };

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
    const id = Date.now();
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    setReactions(prev => [...prev, { id, text, x, y }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
  };

  const toggleCinemaMode = () => {
    const newState = !isCinemaMode;
    setIsCinemaMode(newState);
    p2p.broadcast('CINEMA_TOGGLE', { enabled: newState, roomId: activeRoom });
  };

  if (!activeRoom) {
    return (
      <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-gradient">MUZ CAFES</h1>
            <p className="text-white/40 font-bold mt-2 uppercase text-xs tracking-[0.3em]">P2P Real-Time Social Hub</p>
          </div>
          <button className="bg-primary text-black font-black px-8 py-4 rounded-2xl hover:bg-primary-hover transition-all text-xs tracking-widest shadow-neon active:scale-95">
            + YENİ ODA OLUŞTUR
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map(room => (
            <div key={room.id} className="glass-panel group hover:glass-panel-active transition-all duration-500 p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Coffee size={140} className="text-white" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                  <Coffee size={28} />
                </div>
                <div className="flex items-center gap-2 bg-background-inner px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-neon" />
                   <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">{room.participants} AKTİF</span>
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{room.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                   <ShieldCheck size={12} className="text-primary/60" />
                   <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase">E2E P2P ENCRYPTION</span>
                </div>
              </div>
              <button
                onClick={() => setActiveRoom(room.id)}
                className="w-full py-4 rounded-xl border border-white/10 font-black text-xs tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all relative z-10 group-hover:shadow-neon"
              >
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
      <div className="w-full lg:w-96 border-r border-white/5 flex flex-col bg-background-inner overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-background/50">
          <button onClick={() => setActiveRoom(null)} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"><X size={20}/></button>
          <div className="flex flex-col items-center">
             <div className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">{rooms.find(r => r.id === activeRoom)?.name}</div>
             <span className="text-[8px] font-bold text-white/20 tracking-widest mt-1">HOST: TARAFTAR627</span>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="aspect-video rounded-2xl bg-black border border-white/10 relative overflow-hidden shadow-stadium group">
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
             {!isCameraOn && !isSharingScreen && (
               <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                     <Camera className="text-white/20" size={32} />
                  </div>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Kameran Kapalı</span>
               </div>
             )}
             <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-xl text-[10px] font-black border border-white/10 tracking-widest">
               {isSharingScreen ? 'EKRANIN' : 'KAMERAN'} • CANLI
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button
               onClick={() => setIsCameraOn(!isCameraOn)}
               className={clsx("p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all", isCameraOn ? "bg-primary border-primary text-black shadow-neon" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10")}
             >
               <Camera size={22} />
               <span className="text-[10px] font-black tracking-widest">KAMERA</span>
             </button>
             <button className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white/40 flex flex-col items-center gap-3 hover:bg-white/10 transition-all">
               <Mic size={22} />
               <span className="text-[10px] font-black tracking-widest">MİKROFON</span>
             </button>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-6">
             <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">KATILIMCILAR</h4>
                <div className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">
                   <Users size={10} /> 1284
                </div>
             </div>
             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="flex items-center gap-4 group">
                   <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-black group-hover:border-primary/40 transition-all">U{i}</div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-background-inner rounded-full" />
                   </div>
                   <div className="flex-1">
                     <div className="text-xs font-bold tracking-tight">User_Stadium_{i * 88}</div>
                     <div className="text-[8px] text-primary font-black uppercase tracking-tighter mt-0.5">BAĞLI • P2P</div>
                   </div>
                   <div className="flex gap-1 items-end h-4">
                      <div className="w-1 h-2 bg-primary/20 rounded-full group-hover:h-3 transition-all" />
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      <div className="w-1 h-3 bg-primary/40 rounded-full group-hover:h-2 transition-all" />
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col bg-background">
        <div className="flex-1 bg-background-inner relative flex items-center justify-center overflow-hidden p-8 lg:p-12">
           <div className="w-full h-full bg-[#0a0a0a] rounded-[3rem] border-8 border-white/5 relative shadow-stadium overflow-hidden group">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="absolute inset-0 border border-white/20 m-12 rounded-[2rem]" />
                 <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full" />
              </div>

              {isSharingScreen && <div className="absolute inset-0 bg-primary/5 flex items-center justify-center z-0"><Tv size={120} className="text-primary opacity-5 animate-pulse" /></div>}

              <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseMove={draw} onMouseLeave={stopDrawing} width={1920} height={1080} className="absolute inset-0 w-full h-full cursor-crosshair z-10" />

              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {reactions.map(r => (
                  <div
                    key={r.id}
                    className="absolute animate-float-up bg-primary text-black px-6 py-3 rounded-2xl font-black text-2xl shadow-neon border-2 border-black/20"
                    style={{ left: `${r.x}%`, top: `${r.y}%` }}
                  >
                    {r.text}
                  </div>
                ))}
              </div>

              <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/60 backdrop-blur px-4 py-2 rounded-2xl border border-white/5 z-20">
                 <div className="p-2 bg-primary text-black rounded-lg"><Zap size={14} /></div>
                 <span className="text-[10px] font-black tracking-widest text-white/80 uppercase">Taktik Tahtası Aktif</span>
              </div>
           </div>

           <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-background-card/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] z-40 shadow-stadium">
              <button onClick={toggleScreenShare} className={clsx("p-5 rounded-2xl transition-all active:scale-90", isSharingScreen ? "bg-primary text-black shadow-neon" : "bg-white/5 hover:bg-white/10 text-white/60")} title="Ekran Paylaş">
                <Tv size={26} strokeWidth={2.5} />
              </button>
              <button onClick={toggleCinemaMode} className={clsx("p-5 rounded-2xl transition-all active:scale-90", isCinemaMode ? "bg-primary text-black shadow-neon" : "bg-white/5 hover:bg-white/10 text-white/60")} title="Sinema Modu">
                <Zap size={26} strokeWidth={2.5} />
              </button>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex gap-4">
                <button onClick={() => setBrushColor('#84cc16')} className={clsx("w-10 h-10 rounded-full bg-primary border-4 shadow-neon transition-all active:scale-90", brushColor === '#84cc16' ? "border-white" : "border-transparent")} />
                <button onClick={() => setBrushColor('#ef4444')} className={clsx("w-10 h-10 rounded-full bg-red-500 border-4 transition-all active:scale-90", brushColor === '#ef4444' ? "border-white" : "border-transparent")} />
                <button onClick={() => setBrushColor('#3b82f6')} className={clsx("w-10 h-10 rounded-full bg-blue-500 border-4 transition-all active:scale-90", brushColor === '#3b82f6' ? "border-white" : "border-transparent")} />
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex gap-2">
                {['GOL!', 'WOW!', '🔥🔥'].map(text => (
                  <button key={text} onClick={() => triggerReaction(text)} className="px-6 py-3 bg-white/5 rounded-2xl hover:bg-primary hover:text-black font-black text-xs transition-all active:scale-90 tracking-widest uppercase">{text}</button>
                ))}
              </div>
           </div>
        </div>

        <div className="h-24 border-t border-white/5 bg-background-inner/50 backdrop-blur-xl flex items-center px-8 gap-6 shadow-inner">
           <div className="flex-1 bg-background/50 border border-white/5 rounded-[1.5rem] flex items-center px-6 h-14 focus-within:border-primary/40 transition-all shadow-inner">
             <input type="text" placeholder="Tribünlere mesaj gönder..." className="bg-transparent border-none outline-none flex-1 text-sm font-bold tracking-tight text-white/80 placeholder:text-white/20" />
             <div className="flex gap-4 border-l border-white/5 pl-4 ml-4">
                <button className="text-white/20 hover:text-primary transition-colors"><Heart size={20} /></button>
                <button className="text-white/20 hover:text-primary transition-colors"><Share2 size={20} /></button>
             </div>
           </div>
           <button className="w-14 h-14 bg-primary text-black rounded-2xl flex items-center justify-center hover:bg-primary-hover transition-all shadow-neon active:scale-95 group">
             <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default MuzCafes;
