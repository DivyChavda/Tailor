import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getAllOrders, saveOrder, formatDate } from '../utils/db';
import PaymentModal from '../components/PaymentModal';
import CollectPaymentModal from '../components/CollectPaymentModal';

const STATUS_CONFIG = {
    pending: { label: 'Pending', gujarati: 'બાકી', color: '#E65100', bg: '#FFF3E0', icon: '🕐' },
    stitching: { label: 'Stitching', gujarati: 'સીવણ', color: '#1565C0', bg: '#E3F2FD', icon: '🪡' },
    ready: { label: 'Ready', gujarati: 'તૈયાર', color: '#2E7D32', bg: '#E8F5E9', icon: '✅' },
    delivered: { label: 'Delivered', gujarati: 'ડિલિવર', color: '#6A1B9A', bg: '#F3E5F5', icon: '🎁' },
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0, pending: 0, stitching: 0, ready: 0, delivered: 0, totalRevenue: 0, totalReceivable: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [paymentModal, setPaymentModal] = useState(null); // holds the order being delivered
    const [paymentType, setPaymentType] = useState('full');
    const [partialAmount, setPartialAmount] = useState('');
    const [collectModal, setCollectModal] = useState(null); // holds order for collecting balance

    useEffect(() => {
        setStats(getStats());
        setRecentOrders(getAllOrders().slice(0, 6));
    }, [refresh]);

    const handleStatusChange = (orderId, newStatus) => {
        if (newStatus === 'delivered') {
            const order = getAllOrders().find((o) => o.id === orderId);
            const bal = parseFloat(order?.totalAmount || 0) - parseFloat(order?.advanceAmount || 0);
            if (order && bal > 0) {
                setPaymentType('full');
                setPartialAmount('');
                setPaymentModal(order);
                return;
            }
        }
        const orders = getAllOrders();
        const order = orders.find((o) => o.id === orderId);
        if (order) { saveOrder({ ...order, status: newStatus, updatedAt: new Date().toISOString() }); }
        setRefresh((r) => r + 1);
    };

    const confirmPayment = () => {
        const order = paymentModal;
        const total = parseFloat(order.totalAmount || 0);
        const advance = parseFloat(order.advanceAmount || 0);
        const newAdvance = paymentType === 'full'
            ? total
            : Math.min(advance + parseFloat(partialAmount || 0), total);
        saveOrder({ ...order, status: 'delivered', advanceAmount: newAdvance, updatedAt: new Date().toISOString() });
        setPaymentModal(null);
        setRefresh((r) => r + 1);
    };

    const confirmCollect = (newAdvance) => {
        saveOrder({ ...collectModal, advanceAmount: newAdvance, updatedAt: new Date().toISOString() });
        setCollectModal(null);
        setRefresh((r) => r + 1);
    };

    return (
        <div className="page dashboard-page">
            {/* Page Header */}
            <div className="page-header no-print">
                <div>
                    <h1 className="page-title">🏠 Dashboard</h1>
                    <p className="page-subtitle">ટેઈલર શોપ ઓવર્વ્યૂ</p>
                </div>
                <button className="btn-primary large-btn" onClick={() => navigate('/new-order')}>
                    ➕ New Order
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid no-print">
                <div className="stat-card stat-total">
                    <div className="stat-icon-big">📋</div>
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Orders</div>
                    <div className="stat-gu">કુલ ઓર્ડર</div>
                </div>

                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                    <div
                        key={status}
                        className="stat-card stat-status"
                        style={{ background: cfg.bg }}
                        onClick={() => navigate(`/orders?status=${status}`)}
                    >
                        <div className="stat-icon-big">{cfg.icon}</div>
                        <div className="stat-number" style={{ color: cfg.color }}>
                            {stats[status]}
                        </div>
                        <div className="stat-label">{cfg.label}</div>
                        <div className="stat-gu">{cfg.gujarati}</div>
                    </div>
                ))}

                <div className="stat-card stat-revenue">
                    <div className="stat-icon-big">💰</div>
                    <div className="stat-number">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                    <div className="stat-label">Collected</div>
                    <div className="stat-gu">મળેલ રકમ</div>
                </div>
                <div className="stat-card stat-receivable" onClick={() => navigate('/orders?status=pendingPayment')}>
                    <div className="stat-icon-big">⏳</div>
                    <div className="stat-number">₹{stats.totalReceivable.toLocaleString('en-IN')}</div>
                    <div className="stat-label">Receivable</div>
                    <div className="stat-gu">બાકી વસૂલ</div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="recent-section no-print">
                <div className="section-header">
                    <h2 className="section-title">🕐 Recent Orders</h2>
                    <button className="btn-link" onClick={() => navigate('/orders')}>
                        View All →
                    </button>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🪡</div>
                        <h3>No orders yet!</h3>
                        <p>ગ્રાહકનો ઓર્ડર નોંધવા માટે "New Order" દ્વારા શરૂ કરો</p>
                        <button className="btn-primary" onClick={() => navigate('/new-order')}>
                            ➕ Create First Order
                        </button>
                    </div>
                ) : (
                    <div className="order-cards-grid">
                        {recentOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onView={() => navigate(`/orders/${order.id}`)}
                                onStatusChange={handleStatusChange}
                                onCollect={(o) => setCollectModal(o)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {paymentModal && (
                <PaymentModal
                    order={paymentModal}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    partialAmount={partialAmount}
                    setPartialAmount={setPartialAmount}
                    onConfirm={confirmPayment}
                    onCancel={() => setPaymentModal(null)}
                />
            )}

            {collectModal && (
                <CollectPaymentModal
                    order={collectModal}
                    onConfirm={confirmCollect}
                    onCancel={() => setCollectModal(null)}
                />
            )}
        </div>
    );
}

function OrderCard({ order, onView, onStatusChange, onCollect }) {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const balance = parseFloat(order.totalAmount || 0) - parseFloat(order.advanceAmount || 0);

    return (
        <div className="order-card" onClick={onView}>
            <div className="order-card-top">
                <div className="order-customer-info">
                    <div className="order-customer-name">👩 {order.customer?.name}</div>
                    <div className="order-customer-phone">📞 {order.customer?.phone}</div>
                </div>
                <span
                    className="status-badge"
                    style={{ background: cfg.bg, color: cfg.color }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {cfg.icon} {cfg.label}
                </span>
            </div>

            <div className="order-card-details">
                <span>📅 Order: {formatDate(order.orderDate)}</span>
                <span>🚚 Delivery: {formatDate(order.deliveryDate)}</span>
            </div>

            <div className="order-card-footer">
                <span className="bill-num-tag">{order.billNumber}</span>
                <span>👗 {order.blouses?.length || 0} Blouse(s)</span>
                <span className="order-amount">₹{order.totalAmount || 0}</span>
                {balance > 0 && (
                    <span className="balance-tag">Bal: ₹{balance}</span>
                )}
            </div>

            <div
                className="order-card-bottom-row"
                onClick={(e) => e.stopPropagation()}
            >
                <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    className="status-select"
                    style={{ borderColor: cfg.color, color: cfg.color, flex: 1 }}
                >
                    {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                        <option key={s} value={s}>
                            {c.icon} {c.label}
                        </option>
                    ))}
                </select>
                {balance > 0 && (
                    <button
                        className="btn-collect-sm"
                        onClick={() => onCollect(order)}
                    >
                        💵 ₹{balance}
                    </button>
                )}
            </div>
        </div>
    );
}
