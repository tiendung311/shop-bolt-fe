"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/store";
import { UserForm } from "./UserForm";
import { User } from "@/types";
import { ChatBox } from "./ChatBox";

export function UserList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const currentUser = JSON.parse(localStorage.getItem("authUser") || "{}");

  const [chatWithUser, setChatWithUser] = useState<User | null>(null);

  const handleOpenChat = (user: User) => {
    if (chatWithUser?.id !== user.id) {
      setChatWithUser(user);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8080/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      // Lấy tất cả người dùng từ API
      // .then((data: User[]) => setUsers(data))
      .then((data: User[]) => {
        // Lọc ra những user KHÁC với currentUser
        const filtered = data.filter(
          (user) => user.username !== currentUser.username
        );
        setUsers(filtered);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, [currentUser.username]);

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.lastName} ${user.firstName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleEdit = (user: User) => {
    console.log("Edit user:", user);
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await fetch(`/users/${userId}`, { method: "DELETE" });
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
  };

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
              filteredUsers.map((user) => {
                // console.log("Render user:", user);
                return (
                  <div
                    key={user.id}
                    onClick={() => handleOpenChat(user)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {user.lastName} {user.firstName}
                        </h3>
                        <Badge variant="secondary">@{user.username}</Badge>
                      </div>
                      <p className="text-gray-600 mb-1">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Tạo ngày: {formatDate(user.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && <UserForm user={editingUser} onClose={handleFormClose} />}

      {chatWithUser && (
        <ChatBox
          recipient={chatWithUser}
          onClose={() => setChatWithUser(null)}
        />
      )}
    </div>
  );
}
