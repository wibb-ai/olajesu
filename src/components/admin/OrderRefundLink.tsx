'use client';

import { useDocumentInfo } from '@payloadcms/ui';

/** On an Order in the dashboard: the way to refund it or cancel it for the kitchen. */
export default function OrderRefundLink() {
  const { id } = useDocumentInfo();
  if (!id) return null;
  return (
    <div style={{ margin: '0 0 24px' }}>
      <a href={`/kitchen/orders/${id}`} style={{ display: 'inline-block', background: '#1B4332', color: '#fff', padding: '10px 18px', borderRadius: 999, fontWeight: 700, textDecoration: 'none' }}>
        Refund or cancel this Order →
      </a>
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>Refunds go back to the Customer’s card through Stripe. Master admins only.</div>
    </div>
  );
}
