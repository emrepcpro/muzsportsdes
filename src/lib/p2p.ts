type P2PMessage = {
  id: string;
  type: string;
  payload: any;
  senderId: string;
  timestamp: number;
};

class P2PManager {
  private channel: BroadcastChannel;
  private senderId: string;
  private listeners: Set<(message: P2PMessage) => void> = new Set();
  private messageHistory: Set<string> = new Set();

  constructor() {
    this.channel = new BroadcastChannel('muzsports_p2p_mesh');
    this.senderId = Math.random().toString(36).substring(7);
    this.channel.onmessage = (event) => {
      const message = event.data as P2PMessage;

      // Deduplication logic
      if (this.messageHistory.has(message.id)) return;
      this.messageHistory.add(message.id);

      // Keep history manageable
      if (this.messageHistory.size > 100) {
        const first = this.messageHistory.values().next().value;
        if (first) this.messageHistory.delete(first);
      }

      this.listeners.forEach(listener => listener(message));
    };
  }

  broadcast(type: string, payload: any) {
    const message: P2PMessage = {
      id: `${this.senderId}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type,
      payload,
      senderId: this.senderId,
      timestamp: Date.now(),
    };
    this.channel.postMessage(message);

    // Also notify local listeners for consistency if needed,
    // but usually subscribers handle local state separately to avoid loops.
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
