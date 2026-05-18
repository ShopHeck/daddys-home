export const TEMPLATE_PACKING_SLIP = `<html>
  <body style="margin:0;padding:24px;background:#e5e7eb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 14px 38px rgba(15,23,42,0.14);">
      <header style="padding:36px 44px;background:#111827;color:#ffffff;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#94a3b8;">Packing Slip</div>
              <div style="margin-top:12px;font-size:30px;font-weight:700;">{{companyName}}</div>
            </td>
            <td style="width:200px;text-align:right;vertical-align:top;">
              <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Order #</div>
              <div style="margin-top:6px;font-size:24px;font-weight:700;">{{orderNumber}}</div>
              <div style="margin-top:16px;font-size:13px;color:#cbd5e1;">{{orderDate}}</div>
            </td>
          </tr>
        </table>
      </header>

      <section style="padding:32px 44px 16px 44px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:16px 0;">
          <tr>
            <td style="width:50%;vertical-align:top;padding:20px;border:1px solid #e2e8f0;border-radius:16px;background:#f8fafc;">
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7280;font-weight:700;">Ship From</div>
              <div style="margin-top:10px;font-size:16px;font-weight:700;color:#111827;">{{shipFromName}}</div>
              <div style="margin-top:6px;font-size:14px;line-height:1.7;color:#4b5563;white-space:pre-line;">{{shipFromAddress}}</div>
            </td>
            <td style="width:50%;vertical-align:top;padding:20px;border:2px solid #111827;border-radius:16px;">
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7280;font-weight:700;">Ship To</div>
              <div style="margin-top:10px;font-size:16px;font-weight:700;color:#111827;">{{shipToName}}</div>
              <div style="margin-top:6px;font-size:14px;line-height:1.7;color:#4b5563;white-space:pre-line;">{{shipToAddress}}</div>
            </td>
          </tr>
        </table>
      </section>

      <section style="padding:20px 44px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:16px 18px;text-align:left;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#475569;border-bottom:1px solid #e2e8f0;">Item</th>
              <th style="padding:16px 18px;text-align:left;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#475569;border-bottom:1px solid #e2e8f0;">SKU</th>
              <th style="padding:16px 18px;text-align:center;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#475569;border-bottom:1px solid #e2e8f0;">Qty Ordered</th>
              <th style="padding:16px 18px;text-align:center;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#475569;border-bottom:1px solid #e2e8f0;">Qty Shipped</th>
              <th style="padding:16px 18px;text-align:center;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#475569;border-bottom:1px solid #e2e8f0;">Check</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
              <tr>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#111827;">{{name}}</td>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;font-family:monospace;color:#6b7280;">{{sku}}</td>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:center;color:#374151;">{{qtyOrdered}}</td>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:center;font-weight:700;color:#111827;">{{qtyShipped}}</td>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;text-align:center;"><div style="width:20px;height:20px;border:2px solid #94a3b8;border-radius:4px;margin:0 auto;"></div></td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:16px 44px 36px 44px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:16px 0;">
          <tr>
            <td style="width:50%;vertical-align:top;padding:18px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;">
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7280;font-weight:700;">Shipping Method</div>
              <div style="margin-top:8px;font-size:15px;font-weight:700;color:#111827;">{{shippingMethod}}</div>
              <div style="margin-top:4px;font-size:13px;color:#6b7280;">Tracking: {{trackingNumber}}</div>
            </td>
            <td style="width:50%;vertical-align:top;padding:18px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;">
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7280;font-weight:700;">Special Instructions</div>
              <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#374151;">{{specialInstructions}}</div>
            </td>
          </tr>
        </table>
      </section>

      <footer style="padding:20px 44px;border-top:1px dashed #d1d5db;text-align:center;">
        <div style="font-size:13px;color:#6b7280;">Total Items: <strong>{{totalItems}}</strong> &nbsp;&middot;&nbsp; Boxes: <strong>{{totalBoxes}}</strong> &nbsp;&middot;&nbsp; Weight: <strong>{{totalWeight}}</strong></div>
      </footer>
    </main>
  </body>
</html>`;

export const SAMPLE_PACKING_SLIP = {
  companyName: 'Cascade Goods Co.',
  orderNumber: 'ORD-78421',
  orderDate: 'April 10, 2026',
  shipFromName: 'Cascade Goods Warehouse',
  shipFromAddress: '2200 Distribution Pkwy\nReno, NV 89502',
  shipToName: 'Elena Vasquez',
  shipToAddress: '1847 Maple Avenue, Apt 3C\nSacramento, CA 95814\n(916) 555-0238',
  items: [
    { name: 'Ceramic Pour-Over Set (Matte Black)', sku: 'CER-PO-001-BK', qtyOrdered: '1', qtyShipped: '1' },
    { name: 'Organic Coffee Beans, 12oz', sku: 'COF-ORG-012', qtyOrdered: '2', qtyShipped: '2' },
    { name: 'Bamboo Measuring Spoon Set', sku: 'BAM-MSS-004', qtyOrdered: '1', qtyShipped: '1' },
    { name: 'Insulated Travel Mug, 16oz', sku: 'MUG-INS-016-WH', qtyOrdered: '2', qtyShipped: '2' },
    { name: 'Natural Linen Coasters (Set of 4)', sku: 'LIN-CST-004', qtyOrdered: '1', qtyShipped: '1' }
  ],
  shippingMethod: 'UPS Ground',
  trackingNumber: '1Z999AA10123456784',
  specialInstructions: 'Fragile items - please use bubble wrap on ceramic set. Leave at front door if no answer.',
  totalItems: '7',
  totalBoxes: '2',
  totalWeight: '4.6 lbs'
};
