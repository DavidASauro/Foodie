class WSClient {
  private socket: WebSocket | null = null;

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
      `ws://localhost:8080/api/ws/${roomCode}?username=${username}`
    );

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.socket?.send(JSON.stringify({ type: "ready", username }));
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);
    };

    this.socket.onerror = (error) => console.error("WebSocket error:", error);

    this.socket.onclose = () => {
      localStorage.removeItem("roomCode");
      localStorage.removeItem("username");

      console.log("WebSocket closed");
    };
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
