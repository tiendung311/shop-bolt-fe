"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

const WebSocketContext = createContext<any>(null);
export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [latestMessage, setLatestMessage] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const refresh = () => {
    const t = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("authUser") || "{}");
    setToken(t);
    setAuthUserId(user?.id || null);
  };

  // Gán refresh vào window để AuthProvider gọi được
  useEffect(() => {
    (window as any).__wsRefresh__ = refresh;
    refresh();
    return () => {
      (window as any).__wsRefresh__ = null;
    };
  }, []);

  useEffect(() => {
    if (!token || !authUserId) {
      if (client?.connected) {
        console.log("🔌 Disconnecting WebSocket");
        client.deactivate();
      }
      setClient(null);
      return;
    }

    const socket = new SockJS(`http://localhost:8080/ws-chat?token=${token}`);
    const newClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ WebSocket Connected");

        newClient.subscribe("/user/queue/messages", (message: IMessage) => {
          const body = JSON.parse(message.body);
          setLatestMessage(body);
        });
      },
      onStompError: (frame) => {
        console.error("❗ STOMP error:", frame.headers["message"]);
      },
      onWebSocketError: (event) => {
        console.error("❗ WebSocket error:", event);
      },
    });

    newClient.activate();
    setClient(newClient);

    return () => {
      newClient.deactivate();
      setClient(null);
    };
  }, [token, authUserId]);

  const sendMessage = (msg: any) => {
    if (client?.connected) {
      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(msg),
      });
    } else {
      console.warn("❌ Cannot send message – WebSocket not connected");
    }
  };

  return (
    <WebSocketContext.Provider value={{ client, latestMessage, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};
