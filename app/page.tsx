"use client";

import React, { useMemo, useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserList } from "@/components/users/UserList";
import { ProductList } from "@/components/products/ProductList";
import { OrderList } from "@/components/orders/OrderList";
import { AuthPage } from "@/components/auth/AuthPage";
import { HomePage } from "@/components/home/HomePage";

function AppContent() {
  const { isAuthenticated, isLoading, logout } = useAuth(); // ✅ Chỉ gọi 1 lần
  const [activeTab, setActiveTab] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = () => {
    logout();
    setShowAuth(false); // đảm bảo trở về HomePage
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showAuth ? (
      <AuthPage />
    ) : (
      <AppProvider>
        <HomePage onLoginClick={() => setShowAuth(true)} />
      </AppProvider>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserList />;
      case "products":
        return <ProductList />;
      case "orders":
        return <OrderList />;
      default:
        return <UserList />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
        />
        <div className="lg:pl-64">
          <main className="p-4 lg:p-8">{renderContent()}</main>
        </div>
      </div>
    </AppProvider>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
