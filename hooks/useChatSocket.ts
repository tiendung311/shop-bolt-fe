// hooks/useChatSocket.ts
import { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketProvider";

export const useChatSocket = (receiverId: string, onMessage?: () => void) => {
  const [messages, setMessages] = useState<any[]>([]);
  const { latestMessage, sendMessage: globalSendMessage } = useWebSocket();
  const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const currentUserId = authUser.id;

  useEffect(() => {
    if (!receiverId || !currentUserId) return;
    fetch(`http://localhost:8080/chat/history/${currentUserId}/${receiverId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Error loading chat history:", err));
  }, [receiverId, currentUserId]);

  useEffect(() => {
    if (
      latestMessage &&
      ((latestMessage.sender === receiverId &&
        latestMessage.receiver === currentUserId) ||
        (latestMessage.sender === currentUserId &&
          latestMessage.receiver === receiverId))
    ) {
      setMessages((prev) => [...prev, latestMessage]);

      // 👇 Nếu user đang mở ChatBox và latestMessage là từ đối phương → đánh dấu đã đọc
      if (latestMessage.sender === receiverId) {
        fetch("http://localhost:8080/api/chat/mark-read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            fromUserId: receiverId,
            toUserId: currentUserId,
          }),
        }).catch((err) => console.error("Error marking as read:", err));
      }

      onMessage?.();
    }
  }, [latestMessage, receiverId, currentUserId, onMessage]);

  const sendMessage = (content: string) => {
    const message = {
      sender: currentUserId,
      receiver: receiverId,
      content,
      timestamp: new Date().toISOString(),
    };
    globalSendMessage(message);
    setMessages((prev) => [...prev, message]);
    // onMessage?.();
    setTimeout(() => {
      onMessage?.();
    }, 200);
  };

  return { messages, sendMessage };
};
