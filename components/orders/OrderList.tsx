'use client';

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { formatDate, formatCurrency } from '@/lib/store';
import { OrderForm } from './OrderForm';
import { OrderDetails } from './OrderDetails';
import { Order } from '@/types';

export function OrderList() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const filteredOrders = state.orders.filter(
    order =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleView = (order: Order) => {
    setViewingOrder(order);
    setShowDetails(true);
  };

  const handleDelete = (orderId: string) => {
    if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      dispatch({ type: 'DELETE_ORDER', payload: orderId });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setViewingOrder(null);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h2>
          <p className="text-gray-600">Theo dõi và quản lý các đơn hàng</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Tạo đơn hàng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên khách hàng hoặc mã đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Không tìm thấy đơn hàng nào' : 'Chưa có đơn hàng nào'}
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          #{order.id.slice(-6).toUpperCase()}
                        </h3>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Khách hàng:</span> {order.customerName}
                        </div>
                        <div>
                          <span className="font-medium">Ngày đặt:</span> {formatDate(order.orderDate)}
                        </div>
                        <div>
                          <span className="font-medium">Tổng tiền:</span>{' '}
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {order.items.length} sản phẩm
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
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

      {showForm && (
        <OrderForm
          order={editingOrder}
          onClose={handleFormClose}
        />
      )}

      {showDetails && viewingOrder && (
        <OrderDetails
          order={viewingOrder}
          onClose={handleDetailsClose}
        />
      )}
    </div>
  );
}