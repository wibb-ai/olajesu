/** Banner at the top of the Admin Dashboard: the way to the screens for the day. */
export default function KitchenLink() {
  return (
    <div style={{ padding: '16px 20px', margin: '0 0 24px', borderRadius: 12, background: '#1B4332', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Screens for the day</div>
        <div style={{ opacity: 0.8, fontSize: 13 }}>Cook list, packing list and deliveries, made for a phone.</div>
      </div>
      <a href="/kitchen" style={{ background: '#fff', color: '#1B4332', padding: '10px 18px', borderRadius: 999, fontWeight: 700, textDecoration: 'none' }}>
        Open the kitchen screens →
      </a>
    </div>
  );
}
