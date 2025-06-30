// components/ChatBox.tsx
"use client";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useEffect, useMemo, useRef, useState } from "react";

export const ChatBox = ({
  recipient,
  onClose,
  onNewMessage,
  currentUsername,
}: any) => {
  const receiverId = useMemo(() => recipient?.keycloakUserId, [recipient]);
  const receiverUsername = recipient?.username;
  const handleNewMessage = onNewMessage || (() => {});
  const { messages, sendMessage } = useChatSocket(receiverId, handleNewMessage);

  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text);
      setText("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border rounded-xl shadow-lg p-4 z-50">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">
          Chat với {recipient.firstName} (@{recipient.username})
        </h4>
        <button onClick={onClose}>✖</button>
      </div>
      <div className="h-64 overflow-y-auto bg-gray-100 p-2 rounded">
        {messages.map((msg, idx) => {
          const senderUsername =
            msg.sender === recipient.keycloakUserId ? receiverUsername : "Tôi";
          return (
            <div key={idx} className="text-sm mb-2">
              <strong>{senderUsername}:</strong> {msg.content}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2 mt-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="border p-2 rounded flex-1"
          placeholder="Nhập tin nhắn..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};
