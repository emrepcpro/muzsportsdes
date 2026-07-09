type P2PMessage = {
  type: string;
  payload: any;
  senderId: string;
  timestamp: number;
};

// Declare window extension for TypeScript
declare global {
  interface Window {
    electron?: {
      send: (channel: string, data: any) => void;
      receive: (channel: string, func: (...args: any[]) => void) => () => void;
    };
  }
}

class P2PManager {
  private channel: BroadcastChannel;
  private senderId: string;
  private listeners: Set<(message: P2PMessage) => void> = new Set();
  private sentMessagesHistory: Set<string> = new Set();

  // High performance Canvas buffer & throttling
  private canvasBuffer: any[] = [];
  private canvasTimer: any = null;

  constructor() {
    this.channel = new BroadcastChannel('muzsports_p2p_mesh');
    this.senderId = Math.random().toString(36).substring(7);

    // Local tab / multi-tab BroadcastChannel listener
    this.channel.onmessage = (event) => {
      const msg = event.data as P2PMessage;
      if (msg && msg.senderId !== this.senderId) {
        this.triggerLocalListeners(msg);
      }
    };

    // If running in Electron context, connect to the secure IPC preload bridge
    if (window.electron) {
      window.electron.receive('p2p-receive', (msg: P2PMessage) => {
        // Prevent loop and deduplicate already handled messages
        const messageKey = `${msg.senderId}_${msg.timestamp}_${msg.type}`;
        if (msg.senderId !== this.senderId && !this.sentMessagesHistory.has(messageKey)) {
          this.sentMessagesHistory.add(messageKey);
          // Keep sliding history window
          if (this.sentMessagesHistory.size > 200) {
            const firstKey = this.sentMessagesHistory.keys().next().value;
            if (firstKey) this.sentMessagesHistory.delete(firstKey);
          }
          this.triggerLocalListeners(msg);
          // Sync to other local tabs if any are open
          this.channel.postMessage(msg);
        }
      });
    }
  }

  private triggerLocalListeners(message: P2PMessage) {
    this.listeners.forEach(listener => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error executing P2P listener:', err);
      }
    });
  }

  /**
   * Broadcast message with optional immediate-mode or deferred batching.
   */
  broadcast(type: string, payload: any, immediate = true) {
    // If drawing event and not immediate, buffer to prevent high-frequency congestions
    if (type === 'CANVAS_DRAW' && !immediate) {
      this.canvasBuffer.push(payload);
      if (!this.canvasTimer) {
        this.canvasTimer = setTimeout(() => {
          if (this.canvasBuffer.length > 0) {
            this.sendDirect('CANVAS_DRAW_BATCH', {
              roomId: payload.roomId,
              points: [...this.canvasBuffer],
            });
            this.canvasBuffer = [];
          }
          this.canvasTimer = null;
        }, 16); // 60 FPS Throttle
      }
      return;
    }

    this.sendDirect(type, payload);
  }

  private sendDirect(type: string, payload: any) {
    const message: P2PMessage = {
      type,
      payload,
      senderId: this.senderId,
      timestamp: Date.now(),
    };

    const messageKey = `${message.senderId}_${message.timestamp}_${message.type}`;
    this.sentMessagesHistory.add(messageKey);
    if (this.sentMessagesHistory.size > 200) {
      const firstKey = this.sentMessagesHistory.keys().next().value;
      if (firstKey) this.sentMessagesHistory.delete(firstKey);
    }

    // 1. Send via BroadcastChannel (local browser tabs)
    this.channel.postMessage(message);

    // 2. Send via Electron's LAN UDP Socket bridge if available
    if (window.electron) {
      window.electron.send('p2p-send', message);
    }
  }

  subscribe(callback: (message: P2PMessage) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getSenderId() {
    return this.senderId;
  }
}

export const p2p = new P2PManager();
