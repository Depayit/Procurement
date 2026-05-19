export type PRStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'PO Created';
export type POStatus = 'Draft' | 'Sent' | 'Partially Received' | 'Received' | 'Closed';

export interface PRItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  requesterName: string;
  department: string;
  requestDate: string;
  status: PRStatus;
  totalAmount: number;
  items: PRItem[];
}

export interface ApprovalTask {
  id: string;
  documentId: string;
  documentType: 'PR' | 'PO';
  requester: string;
  requestDate: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  level: number;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  location: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  prId: string;
  orderDate: string;
  deliveryDate: string;
  status: POStatus;
  totalAmount: number;
}
