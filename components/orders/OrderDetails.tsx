'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types';
import { formatDate, formatCurrency } from '@/lib/store';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'Chờ xử lý', variant: 'secondary' as const },
      processing: { label: 'Đang xử lý', variant: 'default' as const },
      shipped: { label: 'Đã gửi', variant: 'outline' as const },
      delivered: { label: 'Đã giao', variant: 'default' as const },
      cancelled: { label: 'Đã hủy', variant: 'destructive' as const },
    };
    return statusConfig[status];
  };

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl mx-auto my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                Chi tiết đơn hàng #{order.id.slice(-6).toUpperCase()}
                <Badge variant={statusBadge.variant}>
                  {statusBadge.label}
                </Badge>
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
              <p className="text-gray-600">{order.customerName}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Thông tin đơn hàng</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Ngày đặt: {formatDate(order.orderDate)}</div>
                <div>Ngày tạo: {formatDate(order.createdAt)}</div>
                <div>Cập nhật lần cuối: {formatDate(order.updatedAt)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4">Sản phẩm đã đặt</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Tổng cộng:</span>
            <span className="text-blue-600">{formatCurrency(order.total)}</span>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}