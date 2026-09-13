import BaseModalWithoutClicker from '@base/components/BaseModalWithoutClicker';
import { TId } from '@base/interfaces';
import CustomersDetails from '@modules/customers/components/CustomersDetails';
import ExpensesDetails from '@modules/expenses/components/ExpensesDetails';
import LedgerDetails from '@modules/ledger/components/LedgerDetails';
import PaymentsDetails from '@modules/payments/components/PaymentsDetails';
import ProductsDetails from '@modules/products/components/ProductsDetails';
import PurchasesDetails from '@modules/purchases/components/PurchasesDetails';
import SalesDetails from '@modules/sales/components/SalesDetails';
import SuppliersDetails from '@modules/suppliers/components/SuppliersDetails';
import UsersDetails from '@modules/users/components/UsersDetails';
import { Empty } from 'antd';
import React, { useState } from 'react';

export type TRecordResource =
  | 'sale'
  | 'purchase'
  | 'expense'
  | 'payment'
  | 'product'
  | 'customer'
  | 'supplier'
  | 'user'
  | 'ledger';

export type TViewReference = (resource: string, id: TId) => void;

/** Accepts singular/plural (and upper/lower case) reference types coming from the backend. */
const RECORD_RESOURCE_ALIASES: Record<string, TRecordResource> = {
  sale: 'sale',
  sales: 'sale',
  purchase: 'purchase',
  purchases: 'purchase',
  expense: 'expense',
  expenses: 'expense',
  payment: 'payment',
  payments: 'payment',
  product: 'product',
  products: 'product',
  customer: 'customer',
  customers: 'customer',
  supplier: 'supplier',
  suppliers: 'supplier',
  user: 'user',
  users: 'user',
  ledger: 'ledger',
  ledgers: 'ledger',
};

const RECORD_TITLES: Record<TRecordResource, string> = {
  sale: 'Sale Details',
  purchase: 'Purchase Details',
  expense: 'Expense Details',
  payment: 'Payment Details',
  product: 'Product Details',
  customer: 'Customer Details',
  supplier: 'Supplier Details',
  user: 'User Details',
  ledger: 'Ledger Entry Details',
};

export const resolveRecordResource = (resource?: string | null): TRecordResource | null => {
  if (!resource) return null;

  return RECORD_RESOURCE_ALIASES[String(resource).trim().toLowerCase()] ?? null;
};

interface IProps {
  open: boolean;
  onClose: () => void;
  /** Reference/entity type, e.g. "purchase", "expense", "payment", "customer". */
  resource?: string | null;
  /** Reference/entity id of the record to display. */
  id?: TId | null;
  title?: string;
  width?: number;
}

/**
 * Popup that fetches and renders the details of any known record (sale, purchase, expense, payment,
 * product, customer, supplier, user, ledger) by resolving the resource to its detail API.
 *
 * Records that themselves point at another record (payments, ledger entries) open the referenced
 * details in a nested popup handled here, so the details views stay free of circular imports.
 */
const RecordDetailsModal: React.FC<IProps> = ({ open, onClose, resource, id, title, width = 1064 }) => {
  const resolvedResource = resolveRecordResource(resource);
  const [nestedReference, setNestedReference] = useState<{ resource: string; id: TId } | null>(null);

  const handleCloseFn = () => {
    setNestedReference(null);
    onClose();
  };

  const handleViewReferenceFn: TViewReference = (referenceResource, referenceId) => {
    setNestedReference({ resource: referenceResource, id: referenceId });
  };

  return (
    <React.Fragment>
      <BaseModalWithoutClicker
        open={open}
        onCancel={handleCloseFn}
        footer={null}
        width={width}
        title={title || (resolvedResource ? RECORD_TITLES[resolvedResource] : 'Details')}
      >
        {open && resolvedResource === 'sale' && <SalesDetails id={id} />}
        {open && resolvedResource === 'purchase' && <PurchasesDetails id={id} />}
        {open && resolvedResource === 'expense' && <ExpensesDetails id={id} />}
        {open && resolvedResource === 'payment' && (
          <PaymentsDetails id={id} onViewReference={handleViewReferenceFn} />
        )}
        {open && resolvedResource === 'product' && <ProductsDetails id={id} />}
        {open && resolvedResource === 'customer' && <CustomersDetails id={id} />}
        {open && resolvedResource === 'supplier' && <SuppliersDetails id={id} />}
        {open && resolvedResource === 'user' && <UsersDetails id={id} />}
        {open && resolvedResource === 'ledger' && <LedgerDetails id={id} onViewReference={handleViewReferenceFn} />}
        {open && !resolvedResource && (
          <Empty description={`No details available for reference type "${resource || 'unknown'}"`} />
        )}
      </BaseModalWithoutClicker>
      {nestedReference && (
        <RecordDetailsModal
          open={!!nestedReference}
          onClose={() => setNestedReference(null)}
          resource={nestedReference.resource}
          id={nestedReference.id}
          width={width}
        />
      )}
    </React.Fragment>
  );
};

export default RecordDetailsModal;
