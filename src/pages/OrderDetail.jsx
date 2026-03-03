import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getOrderById, deleteOrder, formatDate, saveOrder } from '../utils/db';
import BillPrint from '../components/BillPrint';
import WorkerSheet from '../components/WorkerSheet';
import PaymentModal from '../components/PaymentModal';
import CollectPaymentModal from '../components/CollectPaymentModal';

const STATUS_CONFIG = {
    pending: { label: 'Pending', gujarati: 'બાકી', color: '#E65100', bg: '#FFF3E0', icon: '🕐' },
    stitching: { label: 'Stitching', gujarati: 'સીવણ', color: '#1565C0', bg: '#E3F2FD', icon: '🪡' },
    ready: { label: 'Ready', gujarati: 'તૈયાર', color: '#2E7D32', bg: '#E8F5E9', icon: '✅' },
    delivered: { label: 'Delivered', gujarati: 'ડિલિવર', color: '#6A1B9A', bg: '#F3E5F5', icon: '🎁' },
};

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const billRef = useRef();
    const workerRef = useRef();

    const [order, setOrder] = useState(null);
    const [printMode, setPrintMode] = useState(null); // null | 'bill' | 'worker'
    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentType, setPaymentType] = useState('full');
    const [partialAmount, setPartialAmount] = useState('');
    const [collectModal, setCollectModal] = useState(false);

    // Trigger window.print() AFTER React renders the print component into the DOM
    useEffect(() => {
        if (!printMode) return;
        const timer = setTimeout(() => {
            window.print();
            setTimeout(() => setPrintMode(null), 800);
        }, 150);
        return () => clearTimeout(timer);
    }, [printMode]);

    const triggerPrint = (mode) => setPrintMode(mode);

    useEffect(() => {
        const found = getOrderById(id);
        if (!found) {
            navigate('/orders');
            return;
        }
        setOrder(found);

        // Auto-print if redirected from save
        const printParam = searchParams.get('print');
        if (printParam === 'bill') {
            setTimeout(() => triggerPrint('bill'), 600);
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleStatusChange = (newStatus) => {
        if (newStatus === 'delivered') {
            const bal = parseFloat(order.totalAmount || 0) - parseFloat(order.advanceAmount || 0);
            if (bal > 0) {
                setPartialAmount('');
                setPaymentType('full');
                setPaymentModal(true);
                return;
            }
        }
        saveOrder({ ...order, status: newStatus, updatedAt: new Date().toISOString() });
        setOrder((prev) => ({ ...prev, status: newStatus }));
    };

    const confirmPayment = () => {
        const total = parseFloat(order.totalAmount || 0);
        const advance = parseFloat(order.advanceAmount || 0);
        let newAdvance = advance;
        if (paymentType === 'full') {
            newAdvance = total;
        } else {
            const extra = parseFloat(partialAmount || 0);
            newAdvance = Math.min(advance + extra, total);
        }
        const updatedOrder = {
            ...order,
            status: 'delivered',
            advanceAmount: newAdvance,
            updatedAt: new Date().toISOString(),
        };
        saveOrder(updatedOrder);
        setOrder(updatedOrder);
        setPaymentModal(false);
    };

    const handleCollect = (newAdvance) => {
        const updated = { ...order, advanceAmount: newAdvance, updatedAt: new Date().toISOString() };
        saveOrder(updated);
        setOrder(updated);
        setCollectModal(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Delete order ${order.billNumber}? This cannot be undone.`)) {
            deleteOrder(id);
            navigate('/orders');
        }
    };

    if (!order) return <div className="loading">Loading...</div>;

    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const balance =
        parseFloat(order.totalAmount || 0) - parseFloat(order.advanceAmount || 0);

    return (
        <div className="page order-detail-page">
            {/* ---- SCREEN VIEW ---- */}
            <div className={`screen-view ${printMode ? 'hidden-for-print' : ''}`}>
                {/* Header */}
                <div className="page-header no-print">
                    <div>
                        <button className="btn-back" onClick={() => navigate('/orders')}>
                            ← Back
                        </button>
                        <h1 className="page-title">{order.billNumber}</h1>
                        <p className="page-subtitle">👩 {order.customer?.name}</p>
                    </div>
                    <div className="detail-actions">
                        <select
                            className="status-select-large"
                            value={order.status}
                            style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color }}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                                <option key={s} value={s}>
                                    {c.icon} {c.label}
                                </option>
                            ))}
                        </select>
                        <button className="btn-print" onClick={() => triggerPrint('bill')}>
                            🖨️ Print Bill
                        </button>
                        <button className="btn-print-worker" onClick={() => triggerPrint('worker')}>
                            📋 Print Worker Sheet
                        </button>
                        <button className="btn-danger-sm" onClick={handleDelete}>
                            🗑️
                        </button>
                    </div>
                </div>

                {/* Customer Card */}
                <div className="detail-cards-row">
                    <div className="detail-card">
                        <h3 className="detail-card-title">👩 Customer Info</h3>
                        <div className="detail-info-list">
                            <div className="detail-info-row">
                                <span className="info-label">Name</span>
                                <span className="info-value">{order.customer?.name}</span>
                            </div>
                            <div className="detail-info-row">
                                <span className="info-label">Phone</span>
                                <span className="info-value">{order.customer?.phone}</span>
                            </div>
                            {order.customer?.address && (
                                <div className="detail-info-row">
                                    <span className="info-label">Address</span>
                                    <span className="info-value">{order.customer?.address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="detail-card">
                        <h3 className="detail-card-title">📅 Order Info</h3>
                        <div className="detail-info-list">
                            <div className="detail-info-row">
                                <span className="info-label">Bill No</span>
                                <span className="info-value bill-no-text">{order.billNumber}</span>
                            </div>
                            <div className="detail-info-row">
                                <span className="info-label">Order Date</span>
                                <span className="info-value">{formatDate(order.orderDate)}</span>
                            </div>
                            <div className="detail-info-row">
                                <span className="info-label">Delivery</span>
                                <span className="info-value">{formatDate(order.deliveryDate)}</span>
                            </div>
                            <div className="detail-info-row">
                                <span className="info-label">Status</span>
                                <span className="status-badge-sm" style={{ background: cfg.bg, color: cfg.color }}>
                                    {cfg.icon} {cfg.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-card">
                        <h3 className="detail-card-title">💰 Bill Summary</h3>
                        <div className="detail-info-list">
                            <div className="detail-info-row">
                                <span className="info-label">Total</span>
                                <span className="info-value amount-text">₹{order.totalAmount || 0}</span>
                            </div>
                            <div className="detail-info-row">
                                <span className="info-label">Collected</span>
                                <span className="info-value">₹{order.advanceAmount || 0}</span>
                            </div>
                            <div className="detail-info-row">
                                <span className="info-label">Balance</span>
                                <span className={`info-value ${balance > 0 ? 'balance-due' : 'balance-zero'}`}>
                                    {balance > 0 ? `₹${balance}` : '✅ Paid'}
                                </span>
                            </div>
                        </div>
                        {balance > 0 && (
                            <button
                                className="btn-collect-balance"
                                onClick={() => setCollectModal(true)}
                            >
                                💵 Collect ₹{balance} Balance
                            </button>
                        )}
                    </div>
                </div>

                {/* Blouses */}
                <h2 className="section-heading">👗 Blouse Details ({order.blouses?.length})</h2>
                <div className="blouses-detail-grid">
                    {order.blouses?.map((blouse) => (
                        <BlouseDetailCard key={blouse.id} blouse={blouse} />
                    ))}
                </div>

                {order.notes && (
                    <div className="order-notes-box">
                        <strong>📝 Notes:</strong> {order.notes}
                    </div>
                )}
            </div>

            {/* ---- PRINT VIEWS (always in DOM, CSS controls visibility) ---- */}
            <div className={`bill-print-wrapper${printMode === 'bill' ? ' is-printing' : ''}`}>
                <BillPrint order={order} />
            </div>
            <div className={`worker-print-wrapper${printMode === 'worker' ? ' is-printing' : ''}`}>
                <WorkerSheet order={order} />
            </div>

            {paymentModal && (
                <PaymentModal
                    order={order}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    partialAmount={partialAmount}
                    setPartialAmount={setPartialAmount}
                    onConfirm={confirmPayment}
                    onCancel={() => setPaymentModal(false)}
                />
            )}

            {collectModal && (
                <CollectPaymentModal
                    order={order}
                    onConfirm={handleCollect}
                    onCancel={() => setCollectModal(false)}
                />
            )}
        </div>
    );
}

function BlouseDetailCard({ blouse }) {
    const [tab, setTab] = useState('measurements');
    const measurements = blouse.measurements || {};
    const hasMeasurements = Object.values(measurements).some((v) => v !== '');

    const MEASUREMENT_LABELS = {
        bust: 'Bust / છાતી',
        waist: 'Waist / કમર',
        shoulder: 'Shoulder / ખભો',
        blouseLength: 'Blouse Length / બ્લાઉઝ',
        frontLength: 'Front / આગળ',
        backLength: 'Back / પાછળ',
        sleeveLength: 'Sleeve / બાંય',
        sleeveRound: 'Sleeve Round / ઘેર',
        armhole: 'Armhole / બગલ',
        neckFront: 'Neck Front / ગળો આ.',
        neckBack: 'Neck Back / ગળો પા.',
        neckWidth: 'Neck Width / ઘેર',
    };

    return (
        <div className="blouse-detail-card">
            <div className="blouse-detail-header">
                <div className="blouse-detail-title">
                    <span className="blouse-num-circle">#{blouse.number}</span>
                    <div>
                        <div className="blouse-fabric-text">{blouse.fabric || 'Blouse'}</div>
                        <div className="blouse-color-text">{blouse.color}</div>
                    </div>
                </div>
                <div className="blouse-price-tag">₹{blouse.price || 0}</div>
            </div>

            <div className="blouse-detail-tabs">
                <button className={tab === 'measurements' ? 'dtab active' : 'dtab'} onClick={() => setTab('measurements')}>
                    📏 Measurements
                </button>
                {blouse.sketchDataUrl && blouse.sketchDataUrl.length > 100 && (
                    <button className={tab === 'sketch' ? 'dtab active' : 'dtab'} onClick={() => setTab('sketch')}>
                        ✏️ Sketch
                    </button>
                )}
                {blouse.designNotes && (
                    <button className={tab === 'notes' ? 'dtab active' : 'dtab'} onClick={() => setTab('notes')}>
                        📝 Notes
                    </button>
                )}
            </div>

            <div className="blouse-detail-content">
                {tab === 'measurements' && (
                    hasMeasurements ? (
                        <div className="measurements-display-grid">
                            {Object.entries(MEASUREMENT_LABELS).map(([key, label]) =>
                                measurements[key] ? (
                                    <div key={key} className="m-display-item">
                                        <span className="m-display-label">{label}</span>
                                        <span className="m-display-value">
                                            {measurements[key]} {blouse.measurementUnit}
                                        </span>
                                    </div>
                                ) : null
                            )}
                        </div>
                    ) : (
                        <p className="no-data-text">No measurements recorded</p>
                    )
                )}

                {tab === 'sketch' && blouse.sketchDataUrl && (
                    <div className="sketch-display">
                        <img src={blouse.sketchDataUrl} alt="Blouse sketch" className="sketch-img" />
                    </div>
                )}

                {tab === 'notes' && (
                    <div className="notes-display">
                        <p className="gujarati-notes-text" lang="gu">{blouse.designNotes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
