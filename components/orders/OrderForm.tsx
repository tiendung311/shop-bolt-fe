'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Order, OrderItem } from '@/types';
import { generateId, formatCurrency } from '@/lib/store';

interface OrderFormProps {
  order?: Order | null;
  onClose: () => void;
}

export function OrderForm({ order, onClose }: OrderFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    customerName: order?.customerName || '',
    status: order?.status || 'pending' as Order['status'],
    orderDate: order?.orderDate ? order.orderDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });
  const [items, setItems] = useState<OrderItem[]>(
    order?.items || []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addItem = () => {
    setItems([
      ...items,
      {
        id: generateId(),
        productId: '',
        productName: '',
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<OrderItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (product) {
      updateItem(index, {
        productId: product.id,
        productName: product.name,
        price: product.price,
      });
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Tên khách hàng là bắt buộc';
    }

    if (items.length === 0) {
      newErrors.items = 'Phải có ít nhất một sản phẩm';
    }

    items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item_${index}_product`] = 'Vui lòng chọn sản phẩm';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Số lượng phải lớn hơn 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const now = new Date();
    const orderData: Order = {
      id: order?.id || generateId(),
      customerName: formData.customerName.trim(),
      status: formData.status,
      orderDate: new Date(formData.orderDate),
      items: items,
      total: calculateTotal(),
      createdAt: order?.createdAt || now,
      updatedAt: now,
    };

    if (order) {
      dispatch({ type: 'UPDATE_ORDER', payload: orderData });
    } else {
      dispatch({ type: 'ADD_ORDER', payload: orderData });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl mx-auto my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {order ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Tên khách hàng</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Nhập tên khách hàng"
                  className={errors.customerName ? 'border-red-500' : ''}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500 mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Order['status']) => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="shipped">Đã gửi</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="orderDate">Ngày đặt hàng</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Sản phẩm</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm sản phẩm
                </Button>
              </div>

              {errors.items && (
                <p className="text-sm text-red-500 mb-4">{errors.items}</p>
              )}

              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <Label>Sản phẩm</Label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => selectProduct(index, value)}
                        >
                          <SelectTrigger className={errors[`item_${index}_product`] ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Chọn sản phẩm" />
                          </SelectTrigger>
                          <SelectContent>
                            {state.products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`item_${index}_product`] && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors[`item_${index}_product`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>Số lượng</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                          className={errors[`item_${index}_quantity`] ? 'border-red-500' : ''}
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors[`item_${index}_quantity`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>Thành tiền</Label>
                        <div className="p-2 bg-gray-50 rounded text-sm font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>

                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {items.length > 0 && (
                <div className="flex justify-end pt-4 border-t">
                  <div className="text-lg font-bold">
                    Tổng cộng: {formatCurrency(calculateTotal())}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {order ? 'Cập nhật' : 'Tạo đơn hàng'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}