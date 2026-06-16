export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  user_id?: string;
  invoice_number?: string;
  client_id?: string;
  clientName?: string;
  clientAddress?: string;
  issue_date?: string;
  due_date?: string;
  items: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
  notes?: string;
  created_at?: string;
}
