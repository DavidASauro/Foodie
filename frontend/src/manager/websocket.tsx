import { WS_URL } from "../config";

type Message = {
  type: string;
  username?: string;
  step?: number;
  message?: string;
};

class WSClient {
  private socket: WebSocket | null = null;
  private onMessageListeners: ((data: Message) => void)[] = [];

  connect(roomCode: string, username: string) {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket already connecting or connected");
      return;
    }

    this.socket = new WebSocket(
      `${WS_URL}/ws/${roomCode}?username=${username}`
    );

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.socket?.send(JSON.stringify({ type: "ready", username }));
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);
      this.onMessageListeners.forEach((listener) => listener(data));
    };

    this.socket.onerror = (error) => console.error("WebSocket error:", error);

    const cleanup = () => {
      localStorage.removeItem("roomCode");
      localStorage.removeItem("username");
      console.log("WebSocket cleaned up");
    };

    this.socket.onclose = () => cleanup();
    window.addEventListener("beforeunload", cleanup);
  }

  addMessageListener(listener: (data: Message) => void) {
    this.onMessageListeners.push(listener);
  }

  removeMessageListener(listener: (data: Message) => void) {
    this.onMessageListeners = this.onMessageListeners.filter(
      (l) => l !== listener
    );
  }

  send(data: object) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected, can't send message");
    }
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }
}

export const wsClient = new WSClient();
