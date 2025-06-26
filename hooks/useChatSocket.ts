import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useRef, useEffect, useState } from "react";

export const useChatSocket = (token: string, receiverId: string) => {
  const clientRef = useRef<Client | null>(null);
  const initialized = useRef(false);
  const [messages, setMessages] = useState<any[]>([]);

  const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const currentUserId = authUser.id;

  useEffect(() => {
    console.log("📡 Initializing WebSocket useEffect...");

    if (!token || !receiverId || !currentUserId) {
      console.warn("⛔ Token/Receiver/UserID thiếu");
      return;
    }

    if (initialized.current) {
      console.log("🛑 Already initialized WebSocket");
      return;
    }

    // Fetch history
    fetch(`http://localhost:8080/chat/history/${currentUserId}/${receiverId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🧾 Fetched chat history:", data);
        setMessages(data);
      })
      .catch((err) => console.error("Error loading chat history:", err));

    const socket = new SockJS(`http://localhost:8080/ws-chat?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Connected to WebSocket");
        client.subscribe(`/user/queue/messages`, (message: IMessage) => {
          const body = JSON.parse(message.body);
          console.log("📥 New message received:", body);
          setMessages((prev) => [...prev, body]);
        });
      },
    });

    client.activate();
    clientRef.current = client;
    initialized.current = true;

    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
      initialized.current = false;
    };
  }, [token, receiverId, currentUserId]);

  const sendMessage = (content: string) => {
    if (!clientRef.current || !clientRef.current.connected) return;
    const message = {
      sender: currentUserId,
      receiver: receiverId,
      content,
      timestamp: new Date().toISOString(),
    };
    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(message),
    });
    setMessages((prev) => [...prev, message]);
  };

  return { messages, sendMessage };
};
