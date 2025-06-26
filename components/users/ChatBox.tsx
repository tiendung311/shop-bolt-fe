"use client";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useEffect, useMemo, useRef, useState } from "react";

export const ChatBox = ({ token, recipient, onClose }: any) => {
  const receiverId = useMemo(
    () => recipient?.keycloakUserId,
    [recipient?.keycloakUserId]
  );
  const { messages, sendMessage } = useChatSocket(token, receiverId);

  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRefContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (messagesEndRefContainer.current) {
      messagesEndRefContainer.current.scrollTop =
        messagesEndRefContainer.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text);
      setText("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border rounded-xl shadow-lg p-4 space-y-2 z-50">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Chat với {recipient.firstName}</h4>
        <button onClick={onClose}>✖</button>
      </div>
      <div
        className="h-64 overflow-y-auto bg-gray-100 p-2 rounded"
        ref={messagesEndRefContainer}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm mb-2">
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
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
