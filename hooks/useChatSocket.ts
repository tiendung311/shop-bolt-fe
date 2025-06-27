// hooks/useChatSocket.ts
import { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketProvider";

export const useChatSocket = (receiverId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const { latestMessage, sendMessage: globalSendMessage } = useWebSocket();

  const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const currentUserId = authUser.id;

  useEffect(() => {
    if (!receiverId || !currentUserId) return;

    fetch(`http://localhost:8080/chat/history/${currentUserId}/${receiverId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => console.error("Error loading chat history:", err));
  }, [receiverId, currentUserId]);

  // Khi có message mới, nếu đúng là chat với người đang xem, mới thêm
  useEffect(() => {
    if (
      latestMessage &&
      latestMessage.sender === receiverId &&
      latestMessage.receiver === currentUserId
    ) {
      setMessages((prev) => [...prev, latestMessage]);
    }
  }, [latestMessage, receiverId, currentUserId]);

  const sendMessage = (content: string) => {
    const message = {
      sender: currentUserId,
      receiver: receiverId,
      content,
      timestamp: new Date().toISOString(),
    };
    globalSendMessage(message);
    setMessages((prev) => [...prev, message]);
  };

  return { messages, sendMessage };
};
