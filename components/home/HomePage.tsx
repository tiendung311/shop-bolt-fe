"use client";

import React from "react";
import { ShoppingBag, Star, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency } from "@/lib/store";

interface HomePageProps {
  onLoginClick: () => void;
}

export function HomePage({ onLoginClick }: HomePageProps) {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TechStore</h1>
                <p className="text-xs text-gray-500">Premium Technology</p>
              </div>
            </div>

            <Button
              onClick={onLoginClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Khám phá
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}
              Công nghệ{" "}
            </span>
            Tương lai
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Trải nghiệm những sản phẩm công nghệ hàng đầu với chất lượng premium
            và dịch vụ tuyệt vời
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span>4.9/5 từ 2,847 đánh giá</span>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Sản phẩm nổi bật
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá bộ sưu tập sản phẩm công nghệ cao cấp được tuyển chọn kỹ
              lưỡng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {state.products.map((product, index) => {
              const isPopular = index < 2;
              const isLowStock = product.stock < 10;

              return (
                <Card
                  key={product.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 overflow-hidden"
                >
                  <div className="relative">
                    {/* Product Image Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                        <ShoppingBag className="h-12 w-12 text-white" />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {isPopular && (
                          <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1">
                            Phổ biến
                          </Badge>
                        )}
                        {isLowStock && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-1"
                          >
                            Sắp hết
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-3 w-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">(4.8)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(product.price)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Còn {product.stock} sản phẩm
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg"
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? "Hết hàng" : "Xem chi tiết"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Miễn phí vận chuyển
              </h4>
              <p className="text-gray-600">
                Giao hàng miễn phí cho đơn hàng trên 1 triệu đồng
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Chất lượng đảm bảo
              </h4>
              <p className="text-gray-600">
                Sản phẩm chính hãng với bảo hành toàn diện
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Hỗ trợ 24/7
              </h4>
              <p className="text-gray-600">
                Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <h5 className="text-xl font-bold">TechStore</h5>
          </div>
          <p className="text-gray-400 mb-6">
            Nơi công nghệ gặp gỡ phong cách sống hiện đại
          </p>
          <div className="text-sm text-gray-500">
            © 2024 TechStore. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </div>
  );
}
