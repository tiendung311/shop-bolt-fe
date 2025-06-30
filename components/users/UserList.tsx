"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "./UserForm";
import { User } from "@/types";
import { ChatBox } from "./ChatBox";
import { useWebSocket } from "@/hooks/WebSocketProvider";

export function UserList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatWithUser, setChatWithUser] = useState<User | null>(null);

  const currentUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const token = localStorage.getItem("token") || "";
  const { latestMessage } = useWebSocket();

  const loadUsers = useCallback(() => {
    fetch("http://localhost:8080/users")
      .then((res) => res.json())
      .then((data: User[]) => {
        const filtered = data.filter(
          (user) => user.username !== currentUser.username
        );
        setUsers(filtered);
      });
  }, [currentUser.username]);

  const loadConversations = useCallback(() => {
    fetch("http://localhost:8080/api/chat/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setConversations(data));
    // console.log("🔄 Conversations reloaded", conversations);
  }, [token]);

  useEffect(() => {
    loadUsers();
    loadConversations();
  }, [loadUsers, loadConversations]);

  // 👇 Khi có tin nhắn đến hoặc đi → reload
  useEffect(() => {
    if (
      latestMessage &&
      (latestMessage.sender === currentUser.id ||
        latestMessage.receiver === currentUser.id)
    ) {
      loadConversations();
    }
  }, [latestMessage, currentUser.id, loadConversations]);

  // 👇 Mỗi khi conversations hoặc users thay đổi, cập nhật mergedUsers
  const mergedUsers = useMemo(() => {
    return users.map((user) => {
      const convo = conversations.find((c) => c.userId === user.keycloakUserId);
      const isMeSender = convo?.senderId === currentUser.id;

      // Nếu đang mở ChatBox với user này → coi là đã đọc
      const isChattingWithThisUser = chatWithUser?.id === user.id;

      return {
        ...user,
        lastMessage: convo
          ? `${isMeSender ? "Tôi" : convo.username}: ${convo.lastMessage}`
          : "",
        isUnread: !isChattingWithThisUser && (convo?.isUnread || false),
      };
    });
  }, [users, conversations, currentUser.id, chatWithUser]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return mergedUsers.filter((user) => {
      const fullName = `${user.lastName} ${user.firstName}`.toLowerCase();
      return (
        fullName.includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term)
      );
    });
  }, [mergedUsers, searchTerm]);

  const handleOpenChat = async (user: User) => {
    if (chatWithUser?.id !== user.id) {
      await fetch("http://localhost:8080/api/chat/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromUserId: user.keycloakUserId,
          toUserId: currentUser.id,
        }),
      });
      setChatWithUser(user);
      loadConversations();
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleNewMessage = useCallback(() => {
    loadConversations(); // dùng hàm đã khai báo trước
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Quản lý người dùng
          </h2>
          <p className="text-gray-600">
            Quản lý thông tin người dùng trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? "Không tìm thấy người dùng nào"
                  : "Chưa có người dùng nào"}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleOpenChat(user)}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-shadow cursor-pointer ${
                    user.isUnread ? "bg-white" : "bg-gray-100"
                  } hover:shadow-md`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        className={`font-semibold ${
                          user.isUnread ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {user.lastName} {user.firstName}
                      </h3>
                      <Badge variant="secondary">@{user.username}</Badge>
                    </div>
                    {user.lastMessage && (
                      <div className="flex justify-between items-center">
                        <p
                          className={`text-sm truncate max-w-xs ${
                            user.isUnread
                              ? "font-semibold text-black"
                              : "text-gray-500"
                          }`}
                        >
                          {user.lastMessage}
                        </p>
                        {user.isUnread && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && <UserForm user={editingUser} onClose={handleFormClose} />}

      {chatWithUser && (
        <ChatBox
          recipient={chatWithUser}
          currentUsername={currentUser.username}
          onClose={() => setChatWithUser(null)}
          onNewMessage={handleNewMessage}
        />
      )}
    </div>
  );
}
