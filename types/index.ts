export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: Date;
  items: OrderItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export type EntityType = "users" | "products" | "orders";
