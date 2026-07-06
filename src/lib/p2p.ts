type P2PMessage = {
  type: string;
  payload: any;
  senderId: string;
  timestamp: number;
};

class P2PManager {
  private channel: BroadcastChannel;
  private senderId: string;
  private listeners: Set<(message: P2PMessage) => void> = new Set();

  constructor() {
    this.channel = new BroadcastChannel('muzsports_p2p_mesh');
    this.senderId = Math.random().toString(36).substring(7);
    this.channel.onmessage = (event) => {
      this.listeners.forEach(listener => listener(event.data));
    };
  }

  broadcast(type: string, payload: any) {
    const message: P2PMessage = {
      type,
      payload,
      senderId: this.senderId,
      timestamp: Date.now(),
    };
    this.channel.postMessage(message);
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
