export type PRStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'PO Created';
export type POStatus = 'Draft' | 'Sent' | 'Partially Received' | 'Received' | 'Closed';
export type PRUrgency = 'normal' | 'urgent' | 'emergency';

export interface PRItem {
  id: string;
  itemCode?: string;
  description: string;
  specification?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  remark?: string;
}

export interface PRSignatures {
  requestedBy: {
    name: string;
    position: string;
    date: string;
    signed: boolean;
  };
  checkedBy?: {
    name: string;
    position: string;
    date?: string;
    signed?: boolean;
    comments?: string;
  };
  budgetCheckedBy?: {
    name: string;
    position: string;
    date?: string;
    signed?: boolean;
    comments?: string;
  };
  approvedBy?: {
    name: string;
    position: string;
    date?: string;
    signed?: boolean;
    comments?: string;
  };
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  requesterName: string;
  requesterPosition?: string;
  department: string;
  projectCode?: string;
  requestDate: string;
  requiredDate?: string;
  deliveryLocation?: string;
  urgency?: PRUrgency;
  status: PRStatus;
  justification?: string;
  suggestedVendor?: string;
  contactPhone?: string;
  items: PRItem[];
  includeVat?: boolean;
  vatAmount?: number;
  totalAmount: number; // Grand total including VAT if applicable
  attachmentsCount?: number;
  signatures?: PRSignatures;
  templateCategory?: string;
}

export interface PRTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultDepartment?: string;
  defaultJustification?: string;
  defaultUrgency?: PRUrgency;
  items: Omit<PRItem, 'id'>[];
  iconName?: string;
  isCustom?: boolean;
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
  prData?: PurchaseRequest;
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
  unitPrice?: number;
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
