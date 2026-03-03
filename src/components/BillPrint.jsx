import { formatDate } from '../utils/db';

const SHOP_NAME = 'LADIES TAILOR SHOP';
const SHOP_GUJARATI = 'લેડીઝ ટેઈલર શોપ';

export default function BillPrint({ order }) {
    if (!order) return null;
    const balance =
        parseFloat(order.totalAmount || 0) - parseFloat(order.advanceAmount || 0);

    return (
        <div className="bill-print-page">
            {/* Shop Header */}
            <div className="bill-shop-header">
                <div className="bill-shop-name">{SHOP_NAME}</div>
                <div className="bill-shop-gujarati">✂️ {SHOP_GUJARATI} ✂️</div>
                <div className="bill-shop-tagline">Quality Stitching | Ladies Blouses & Suits</div>
            </div>

            <div className="bill-divider" />

            {/* Bill Info Row */}
            <div className="bill-meta-row">
                <div className="bill-meta-left">
                    <div className="bill-meta-item">
                        <span className="bill-meta-label">Bill No:</span>
                        <span className="bill-meta-value bold">{order.billNumber}</span>
                    </div>
                    <div className="bill-meta-item">
                        <span className="bill-meta-label">Date:</span>
                        <span className="bill-meta-value">{formatDate(order.orderDate)}</span>
                    </div>
                    <div className="bill-meta-item">
                        <span className="bill-meta-label">Delivery:</span>
                        <span className="bill-meta-value bold">{formatDate(order.deliveryDate)}</span>
                    </div>
                </div>
                <div className="bill-meta-right">
                    <div className="bill-meta-item">
                        <span className="bill-meta-label">Customer:</span>
                        <span className="bill-meta-value bold">{order.customer?.name}</span>
                    </div>
                    <div className="bill-meta-item">
                        <span className="bill-meta-label">Phone:</span>
                        <span className="bill-meta-value">{order.customer?.phone}</span>
                    </div>
                    {order.customer?.address && (
                        <div className="bill-meta-item">
                            <span className="bill-meta-label">Address:</span>
                            <span className="bill-meta-value">{order.customer?.address}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bill-divider" />

            {/* Items Table */}
            <table className="bill-items-table">
                <thead>
                    <tr>
                        <th className="th-no">No.</th>
                        <th className="th-desc">Description (વિગત)</th>
                        <th className="th-amount">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {order.blouses?.map((blouse) => (
                        <tr key={blouse.id}>
                            <td className="td-no">{blouse.number}</td>
                            <td className="td-desc">
                                <strong>Blouse {blouse.number}</strong>
                                {(blouse.fabric || blouse.color) && (
                                    <span className="desc-detail">
                                        {' '}— {[blouse.fabric, blouse.color].filter(Boolean).join(', ')}
                                    </span>
                                )}
                                {blouse.designNotes && (
                                    <div className="desc-note" lang="gu">{blouse.designNotes.substring(0, 80)}{blouse.designNotes.length > 80 ? '...' : ''}</div>
                                )}
                            </td>
                            <td className="td-amount">₹{parseFloat(blouse.price || 0).toFixed(2)}</td>
                        </tr>
                    ))}
                    {/* Padding rows if fewer items */}
                    {(order.blouses?.length || 0) < 3 &&
                        Array.from({ length: 3 - (order.blouses?.length || 0) }).map((_, i) => (
                            <tr key={`pad-${i}`} className="pad-row">
                                <td />
                                <td />
                                <td />
                            </tr>
                        ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="bill-totals-section">
                <div className="bill-total-row">
                    <span>Total Amount (કુલ ભાવ)</span>
                    <span className="bill-total-amount">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="bill-total-row">
                    <span>Advance Received (અગ્રિમ)</span>
                    <span>₹{parseFloat(order.advanceAmount || 0).toFixed(2)}</span>
                </div>
                <div className="bill-total-row balance-final">
                    <span>Balance Due (બાકી)</span>
                    <span>₹{balance.toFixed(2)}</span>
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="bill-notes">
                    <strong>Note:</strong> {order.notes}
                </div>
            )}

            <div className="bill-divider" />

            {/* Footer */}
            <div className="bill-footer">
                <div className="bill-signature">
                    <div className="signature-line">__________________</div>
                    <div>Customer Signature</div>
                </div>
                <div className="bill-thank-you">
                    <div>🙏 Thank You for Your Business!</div>
                    <div>ફરી ફોન કરવા આવજો</div>
                </div>
                <div className="bill-signature">
                    <div className="signature-line">__________________</div>
                    <div>Tailor Signature</div>
                </div>
            </div>

            <div className="bill-receipt-note">
                * This is a computer generated receipt. Please keep it for reference.
            </div>
        </div>
    );
}
