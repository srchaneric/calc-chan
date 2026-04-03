export type UserRole = 'ADM' | 'GERENTE' | 'VENDEDOR';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  managerId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  icon: string;
}

export interface Combo {
  id: string;
  name: string;
  productIds: string[];
  discountPercentage: number;
  totalPrice: number;
}

export interface ProposalItem {
  productId: string;
  quantity: number;
  priceAtTime: number;
}

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  items: ProposalItem[];
  subtotal: number;
  discountAmount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  total: number;
  status: 'RASCUNHO' | 'ENVIADO' | 'FECHADO' | 'PERDIDO' | 'PAUSADO';
  createdBy: string; // User ID
  createdAt: string;
}
