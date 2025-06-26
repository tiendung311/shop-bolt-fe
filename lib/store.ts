"use client";

import { User, Product, Order, OrderItem } from "@/types";

// Mock data
export const initialUsers: User[] = [
  {
    id: "1",
    lastName: "Nguyễn",
    firstName: "Văn An",
    username: "nguyenvanan",
    email: "an.nguyen@email.com",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    lastName: "Trần",
    firstName: "Thị Bích",
    username: "tranbinhthii",
    email: "binh.tran@email.com",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    lastName: "Lê",
    firstName: "Minh Công",
    username: "leminhcong",
    email: "cong.le@email.com",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
];

export const initialProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    price: 29990000,
    stock: 25,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    name: "MacBook Air M3",
    price: 32990000,
    stock: 15,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "3",
    name: "AirPods Pro",
    price: 6990000,
    stock: 50,
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
  },
  {
    id: "4",
    name: 'iPad Pro 12.9"',
    price: 26990000,
    stock: 12,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
];

export const initialOrders: Order[] = [
  {
    id: "1",
    customerName: "Nguyễn Văn An",
    status: "delivered",
    orderDate: new Date("2024-02-15"),
    items: [
      {
        id: "1",
        productId: "1",
        productName: "iPhone 15 Pro",
        quantity: 1,
        price: 29990000,
      },
    ],
    total: 29990000,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-18"),
  },
  {
    id: "2",
    customerName: "Trần Thị Bình",
    status: "processing",
    orderDate: new Date("2024-02-20"),
    items: [
      {
        id: "2",
        productId: "2",
        productName: "MacBook Air M3",
        quantity: 1,
        price: 32990000,
      },
      {
        id: "3",
        productId: "3",
        productName: "AirPods Pro",
        quantity: 2,
        price: 6990000,
      },
    ],
    total: 46970000,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
  },
  {
    id: "3",
    customerName: "Lê Minh Công",
    status: "pending",
    orderDate: new Date("2024-02-25"),
    items: [
      {
        id: "4",
        productId: "4",
        productName: 'iPad Pro 12.9"',
        quantity: 1,
        price: 26990000,
      },
    ],
    total: 26990000,
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-02-25"),
  },
];

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    return "Ngày không hợp lệ";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
