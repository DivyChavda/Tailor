import { formatDate } from '../utils/db';

const MEASUREMENT_LABELS = {
    bust: { en: 'Bust / Chest', gu: 'છાતી' },
    waist: { en: 'Waist', gu: 'કમર' },
    shoulder: { en: 'Shoulder', gu: 'ખભો' },
    blouseLength: { en: 'Blouse Length', gu: 'બ્લાઉઝ' },
    frontLength: { en: 'Front Length', gu: 'આગળ' },
    backLength: { en: 'Back Length', gu: 'પાછળ' },
    sleeveLength: { en: 'Sleeve Length', gu: 'બાંય' },
    sleeveRound: { en: 'Sleeve Round', gu: 'ઘેર' },
    armhole: { en: 'Armhole', gu: 'બગલ' },
    neckFront: { en: 'Neck Front', gu: 'ગળો આ.' },
    neckBack: { en: 'Neck Back', gu: 'ગળો પા.' },
    neckWidth: { en: 'Neck Width', gu: 'ગળો ઘ.' },
};

export default function WorkerSheet({ order }) {
    if (!order) return null;

    return (
        <div className="worker-sheet-page">
            {/* Work Order Header */}
            <div className="ws-header">
                <div className="ws-shop-name">✂️ LADIES TAILOR SHOP — WORK ORDER</div>
                <div className="ws-order-meta">
                    <div>
                        <strong>Customer:</strong> {order.customer?.name} &nbsp;|&nbsp;
                        <strong>Ph:</strong> {order.customer?.phone}
                    </div>
                    <div>
                        <strong>Bill No:</strong> {order.billNumber} &nbsp;|&nbsp;
                        <strong>Date:</strong> {formatDate(order.orderDate)} &nbsp;|&nbsp;
                        <strong>Delivery:</strong> {formatDate(order.deliveryDate)}
                    </div>
                </div>
            </div>

            {/* One section per blouse */}
            {order.blouses?.map((blouse, index) => {
                const measurements = blouse.measurements || {};
                const hasMeasurements = Object.values(measurements).some((v) => v !== '');
                const hasSketch =
                    blouse.sketchDataUrl && blouse.sketchDataUrl.length > 100;

                return (
                    <div key={blouse.id} className={`ws-blouse-section ${index > 0 ? 'ws-page-break' : ''}`}>
                        {/* Blouse Header */}
                        <div className="ws-blouse-header">
                            <div className="ws-blouse-title">
                                BLOUSE {blouse.number} / બ્લાઉઝ {blouse.number}
                            </div>
                            <div className="ws-blouse-info">
                                {blouse.fabric && (
                                    <span>
                                        <strong>Fabric:</strong> {blouse.fabric}
                                    </span>
                                )}
                                {blouse.color && (
                                    <span>
                                        <strong>Color:</strong> {blouse.color}
                                    </span>
                                )}
                                <span>
                                    <strong>Unit:</strong> {blouse.measurementUnit || 'in'}
                                </span>
                            </div>
                        </div>

                        <div className="ws-content-row">
                            {/* Measurements Table */}
                            <div className="ws-measurements-col">
                                <div className="ws-section-label">📏 MEASUREMENTS (માપ)</div>
                                {hasMeasurements ? (
                                    <table className="ws-measurements-table">
                                        <tbody>
                                            {Object.entries(MEASUREMENT_LABELS).map(([key, labels]) =>
                                                measurements[key] ? (
                                                    <tr key={key}>
                                                        <td className="ws-m-label">
                                                            {labels.en}
                                                            <span className="ws-m-gu"> / {labels.gu}</span>
                                                        </td>
                                                        <td className="ws-m-value">
                                                            <strong>
                                                                {measurements[key]} {blouse.measurementUnit || 'in'}
                                                            </strong>
                                                        </td>
                                                    </tr>
                                                ) : null
                                            )}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="ws-no-data">No measurements recorded</p>
                                )}
                            </div>

                            {/* Sketch Column */}
                            {hasSketch && (
                                <div className="ws-sketch-col">
                                    <div className="ws-section-label">✏️ DESIGN SKETCH (સ્કેચ)</div>
                                    <div className="ws-sketch-box">
                                        <img
                                            src={blouse.sketchDataUrl}
                                            alt={`Blouse ${blouse.number} sketch`}
                                            className="ws-sketch-img"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Design Notes */}
                        {blouse.designNotes && (
                            <div className="ws-notes-section">
                                <div className="ws-section-label">📝 DESIGN NOTES (ડિઝાઇન નોંધ)</div>
                                <div className="ws-notes-text" lang="gu">
                                    {blouse.designNotes}
                                </div>
                            </div>
                        )}

                        {/* Worker signature box */}
                        <div className="ws-signature-row">
                            <div className="ws-sig-box">
                                Worker Initials: __________
                            </div>
                            <div className="ws-sig-box">
                                Checked By: __________
                            </div>
                            <div className="ws-sig-box">
                                Completed: __________
                            </div>
                        </div>
                    </div>
                );
            })}

            <div className="ws-footer">
                Customer: {order.customer?.name} | Ph: {order.customer?.phone} |
                Bill: {order.billNumber} | Delivery: {formatDate(order.deliveryDate)}
            </div>
        </div>
    );
}
