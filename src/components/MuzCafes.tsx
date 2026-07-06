import React, { useState, useRef, useEffect } from 'react';
import { Coffee, Tv, Camera, Mic, Share2, Heart, X, Send, Users, ShieldCheck, Zap, Link as LinkIcon, Trash2 } from 'lucide-react';
import { p2p } from '../lib/p2p';
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
  const [brushSize, setBrushSize] = useState(5);

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
          ctx.lineWidth = msg.payload.size;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          if (msg.payload.isStart) {
             ctx.beginPath();
             ctx.moveTo(msg.payload.x, msg.payload.y);
          } else {
             ctx.lineTo(msg.payload.x, msg.payload.y);
             ctx.stroke();
          }
        }
      } else if (msg.type === 'CANVAS_CLEAR' && msg.payload.roomId === activeRoom) {
         clearLocalCanvas();
      } else if (msg.type === 'REACTION' && msg.payload.roomId === activeRoom) {
        spawnReaction(msg.payload.text);
      } else if (msg.type === 'CINEMA_TOGGLE' && msg.payload.roomId === activeRoom) {
        setIsCinemaMode(msg.payload.enabled);
      }
    });
    return () => { unsub(); };
  }, [activeRoom]);

  const spawnReaction = (text: string) => {
    const id = Date.now();
    const x = Math.random() * 60 + 20;
    const y = Math.random() * 60 + 20;
    setReactions(prev => [...prev, { id, text, x, y }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
  };

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

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      p2p.broadcast('CANVAS_DRAW', { x, y, color: brushColor, size: brushSize, isStart: true, roomId: activeRoom });
    }
    draw(e);
  };

  const stopDrawing = () => setIsDrawing(false);

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    p2p.broadcast('CANVAS_DRAW', { x, y, color: brushColor, size: brushSize, isStart: false, roomId: activeRoom });
  };

  const clearLocalCanvas = () => {
     const canvas = canvasRef.current;
     const ctx = canvas?.getContext('2d');
     if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const clearCanvas = () => {
     clearLocalCanvas();
     p2p.broadcast('CANVAS_CLEAR', { roomId: activeRoom });
  };

  const triggerReaction = (text: string) => {
    p2p.broadcast('REACTION', { text, roomId: activeRoom });
    spawnReaction(text);
  };

  const toggleCinemaMode = () => {
    const newState = !isCinemaMode;
    setIsCinemaMode(newState);
    p2p.broadcast('CINEMA_TOGGLE', { enabled: newState, roomId: activeRoom });
  };

  const copyInviteLink = () => {
    const link = `https://muzsports.com/join/${activeRoom}`;
    navigator.clipboard.writeText(link);
    alert('DAVET LİNKİ KOPYALANDI: ' + link);
  };

  if (!activeRoom) {
    return (
      <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 stadium-grid h-full overflow-y-auto custom-scrollbar">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-gradient uppercase">MUZ CAFES</h1>
            <p className="text-primary font-black mt-2 uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              P2P REAL-TIME SOCIAL HUB • {rooms.length} AKTİF KANAL
            </p>
          </div>
          <button className="btn-primary">
            + YENİ TARAFTAR ODASI OLUŞTUR
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map(room => (
            <div key={room.id} className="glass-panel group hover:glass-panel-active transition-all duration-500 p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5">
                  <Coffee size={32} />
                </div>
                <div className="flex items-center gap-2 bg-black px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">{room.participants} AKTİF</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors uppercase">{room.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                   <ShieldCheck size={14} className="text-primary/60" />
                   <span className="text-[10px] font-black text-white/30 tracking-widest uppercase italic">E2E ENCRYPTED MESH</span>
                </div>
              </div>
              <button
                onClick={() => setActiveRoom(room.id)}
                className="w-full py-5 rounded-2xl border border-white/5 bg-white/5 font-black text-[10px] tracking-[0.2em] hover:bg-primary hover:text-black hover:border-primary transition-all hover:shadow-neon-strong uppercase"
              >
                TRİBÜNE KATIL
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-background">
      <div className="w-full lg:w-96 border-r border-white/5 flex flex-col bg-background-inner/50 backdrop-blur-xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-background/30">
          <button onClick={() => setActiveRoom(null)} className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"><X size={20}/></button>
          <div className="flex flex-col items-center">
             <div className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">{rooms.find(r => r.id === activeRoom)?.name}</div>
             <span className="text-[8px] font-black text-white/20 tracking-[0.3em] mt-1.5 uppercase">MuzSports P2P Node</span>
          </div>
          <button onClick={copyInviteLink} className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-primary transition-all"><Share2 size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="aspect-video rounded-3xl bg-black border border-white/10 relative overflow-hidden shadow-stadium group">
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
             {!isCameraOn && !isSharingScreen && (
               <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center">
                     <Camera className="text-white/10" size={32} />
                  </div>
                  <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">GÖRÜNTÜ YOK</span>
               </div>
             )}
             <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl text-[9px] font-black border border-white/10 tracking-widest uppercase">
               <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
               {isSharingScreen ? 'EKRAN PAYLAŞILIYOR' : 'KAMERAN AKTİF'}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button
               onClick={() => setIsCameraOn(!isCameraOn)}
               className={clsx("p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all", isCameraOn ? "bg-primary border-primary text-black shadow-neon" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10")}
             >
               <Camera size={24} strokeWidth={2.5} />
               <span className="text-[10px] font-black tracking-widest">KAMERA</span>
             </button>
             <button className="p-6 rounded-2xl bg-white/5 border border-white/5 text-white/40 flex flex-col items-center gap-3 hover:bg-white/10 transition-all">
               <Mic size={24} strokeWidth={2.5} />
               <span className="text-[10px] font-black tracking-widest">SES</span>
             </button>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-6">
             <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">CANLI TRİBÜN</h4>
                <div className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                   <Users size={12} /> 1,284
                </div>
             </div>
             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-all">
                   <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-black group-hover:border-primary/40 transition-all overflow-hidden shadow-inner uppercase">T{i}</div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-4 border-background-inner rounded-full shadow-neon" />
                   </div>
                   <div className="flex-1">
                     <div className="text-xs font-black tracking-tight uppercase">Taraftar_61_{i * 44}</div>
                     <div className="text-[8px] text-primary font-black uppercase tracking-[0.2em] mt-1 italic flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                        P2P BAĞLANTISI
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col bg-background stadium-grid">
        <div className={clsx("flex-1 relative flex items-center justify-center transition-all duration-700", isCinemaMode ? "p-0" : "p-12 lg:p-20")}>
           <div className={clsx("w-full h-full bg-[#0a0a0a] border-white/5 relative shadow-stadium overflow-hidden group transition-all duration-700", isCinemaMode ? "rounded-none border-0" : "rounded-[4rem] border-[12px]")}>
              {/* Field Markings */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                 <div className="absolute inset-0 border-[2px] border-white/40 m-12 rounded-[3rem]" />
                 <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/40" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-[2px] border-white/40 rounded-full" />
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 border-b-[2px] border-white/40" />
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 border-t-[2px] border-white/40" />
              </div>

              {isSharingScreen && <div className="absolute inset-0 bg-primary/5 flex items-center justify-center z-0"><Tv size={160} className="text-primary opacity-10 animate-pulse" /></div>}

              <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseMove={draw} onMouseLeave={stopDrawing} width={1920} height={1080} className="absolute inset-0 w-full h-full cursor-crosshair z-10" />

              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {reactions.map(r => (
                  <div
                    key={r.id}
                    className="absolute animate-float-up bg-primary text-black px-8 py-4 rounded-3xl font-black text-3xl shadow-neon border-4 border-black/10"
                    style={{ left: `${r.x}%`, top: `${r.y}%` }}
                  >
                    {r.text}
                  </div>
                ))}
              </div>

              <div className="absolute top-10 left-10 flex items-center gap-4 bg-black/60 backdrop-blur-2xl px-5 py-3 rounded-2xl border border-white/10 z-20 shadow-2xl">
                 <div className="p-2.5 bg-primary text-black rounded-xl shadow-neon"><Zap size={18} strokeWidth={3} /></div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase leading-none">TAKTİK TAHTASI</span>
                   <span className="text-[8px] font-bold text-primary tracking-widest mt-1.5 uppercase italic leading-none">GERÇEK ZAMANLI SENKRONİZASYON</span>
                 </div>
              </div>
           </div>

           <div className={clsx("absolute left-1/2 -translate-x-1/2 flex items-center gap-8 bg-background-card/90 backdrop-blur-3xl border border-white/10 p-7 rounded-[3rem] z-40 shadow-stadium transition-all duration-700", isCinemaMode ? "bottom-12" : "bottom-24")}>
              <div className="flex gap-4">
                <button onClick={toggleScreenShare} className={clsx("p-6 rounded-2xl transition-all active:scale-90 shadow-inner", isSharingScreen ? "bg-primary text-black shadow-neon" : "bg-white/5 hover:bg-white/10 text-white/40")} title="Ekran Paylaş">
                  <Tv size={28} strokeWidth={2.5} />
                </button>
                <button onClick={toggleCinemaMode} className={clsx("p-6 rounded-2xl transition-all active:scale-90 shadow-inner", isCinemaMode ? "bg-primary text-black shadow-neon" : "bg-white/5 hover:bg-white/10 text-white/40")} title="Sinema Modu">
                  <Zap size={28} strokeWidth={2.5} />
                </button>
                <button onClick={clearCanvas} className="p-6 rounded-2xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-white/40 transition-all active:scale-90 shadow-inner" title="Temizle">
                  <Trash2 size={28} strokeWidth={2.5} />
                </button>
              </div>

              <div className="w-px h-12 bg-white/10" />

              <div className="flex items-center gap-5">
                {[
                  { color: '#84cc16', shadow: 'rgba(132, 204, 22, 0.5)' },
                  { color: '#ef4444', shadow: 'rgba(239, 68, 68, 0.5)' },
                  { color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.5)' },
                  { color: '#ffffff', shadow: 'rgba(255, 255, 255, 0.5)' }
                ].map(c => (
                  <button
                    key={c.color}
                    onClick={() => setBrushColor(c.color)}
                    className={clsx("w-12 h-12 rounded-full border-4 transition-all active:scale-90", brushColor === c.color ? "scale-110 border-white" : "border-transparent opacity-40")}
                    style={{ backgroundColor: c.color, boxShadow: brushColor === c.color ? `0 0 20px ${c.shadow}` : 'none' }}
                  />
                ))}
              </div>

              <div className="w-px h-12 bg-white/10" />

              <div className="flex gap-3">
                {['GOL!', 'WOW!', 'FENA!', '🔥🔥'].map(text => (
                  <button
                    key={text}
                    onClick={() => triggerReaction(text)}
                    className="px-8 py-4 bg-white/5 rounded-2xl hover:bg-primary hover:text-black font-black text-xs transition-all active:scale-90 tracking-widest uppercase border border-white/5"
                  >
                    {text}
                  </button>
                ))}
              </div>
           </div>
        </div>

        <div className="h-28 border-t border-white/5 bg-background-inner/80 backdrop-blur-3xl flex items-center px-12 gap-8 shrink-0">
           <div className="flex-1 bg-black/40 border border-white/5 rounded-[2rem] flex items-center px-8 h-16 focus-within:border-primary/40 transition-all shadow-inner group">
             <input type="text" placeholder="TRİBÜNLERE MESAJ GÖNDER..." className="bg-transparent border-none outline-none flex-1 text-[11px] font-black tracking-widest text-white uppercase placeholder:text-white/10" />
             <div className="flex gap-6 border-l border-white/5 pl-8 ml-8">
                <button className="text-white/10 hover:text-red-500 transition-colors transform active:scale-110"><Heart size={24} strokeWidth={2.5} /></button>
                <button className="text-white/10 hover:text-primary transition-colors transform active:scale-110" onClick={copyInviteLink}><LinkIcon size={24} strokeWidth={2.5} /></button>
             </div>
           </div>
           <button className="w-16 h-16 bg-primary text-black rounded-[1.5rem] flex items-center justify-center hover:bg-primary-hover transition-all shadow-neon hover:shadow-neon-strong active:scale-95 group">
             <Send size={28} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default MuzCafes;
