import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllOrders, saveOrder, formatDate, sendWhatsAppReady } from '../utils/db';
import PaymentModal from '../components/PaymentModal';
import CollectPaymentModal from '../components/CollectPaymentModal';

const STATUS_CONFIG = {
    pending: { label: 'Pending', gujarati: 'બાકી', color: '#E65100', bg: '#FFF3E0', icon: '🕐' },
    stitching: { label: 'Stitching', gujarati: 'સીવણ', color: '#1565C0', bg: '#E3F2FD', icon: '🪡' },
    ready: { label: 'Ready', gujarati: 'તૈયાર', color: '#2E7D32', bg: '#E8F5E9', icon: '✅' },
    delivered: { label: 'Delivered', gujarati: 'ડિલિવર', color: '#6A1B9A', bg: '#F3E5F5', icon: '🎁' },
};

export default function OrderList() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    const [paymentModal, setPaymentModal] = useState(null); // holds the order being delivered
    const [paymentType, setPaymentType] = useState('full');
    const [partialAmount, setPartialAmount] = useState('');
    const [collectModal, setCollectModal] = useState(null);

    const reload = () => setOrders(getAllOrders());

    useEffect(() => { reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleStatusChange = (id, newStatus) => {
        if (newStatus === 'delivered') {
            const order = orders.find((o) => o.id === id);
            const bal = parseFloat(order?.totalAmount || 0) - parseFloat(order?.advanceAmount || 0);
            if (order && bal > 0) {
                setPaymentType('full');
                setPartialAmount('');
                setPaymentModal(order);
                return;
            }
        }
        const order = orders.find((o) => o.id === id);
        if (order) {
            saveOrder({ ...order, status: newStatus, updatedAt: new Date().toISOString() });
            if (newStatus === 'ready') sendWhatsAppReady({ ...order, status: 'ready' });
        }
        reload();
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
        reload();
    };

    const pendingPaymentCount = orders.filter(
        (o) => parseFloat(o.totalAmount || 0) - parseFloat(o.advanceAmount || 0) > 0
    ).length;

    const filtered = orders.filter((o) => {
        const matchSearch =
            !search ||
            o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
            o.customer?.phone?.includes(search) ||
            o.billNumber?.toLowerCase().includes(search.toLowerCase());
        const balance = parseFloat(o.totalAmount || 0) - parseFloat(o.advanceAmount || 0);
        const matchStatus =
            statusFilter === 'all'
                ? true
                : statusFilter === 'pendingPayment'
                    ? balance > 0
                    : o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const confirmCollect = (newAdvance) => {
        saveOrder({ ...collectModal, advanceAmount: newAdvance, updatedAt: new Date().toISOString() });
        setCollectModal(null);
        reload();
    };

    return (
        <div className="page orders-page no-print">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📋 All Orders</h1>
                    <p className="page-subtitle">ઓર્ડર યાદી — {filtered.length} orders</p>
                </div>
                <button className="btn-primary large-btn" onClick={() => navigate('/new-order')}>
                    ➕ New Order
                </button>
            </div>

            {/* Filters */}
            <div className="orders-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, phone, bill no..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="clear-search" onClick={() => setSearch('')}>
                            ✕
                        </button>
                    )}
                </div>

                <div className="status-filters">
                    <button
                        className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All ({orders.length})
                    </button>
                    {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                        <button
                            key={s}
                            className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
                            style={statusFilter === s ? { background: c.bg, color: c.color, borderColor: c.color } : {}}
                            onClick={() => setStatusFilter(s)}
                        >
                            {c.icon} {c.label}
                        </button>
                    ))}
                    <button
                        className={`filter-btn pending-pay-btn ${statusFilter === 'pendingPayment' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('pendingPayment')}
                    >
                        💰 Pending Payment ({pendingPaymentCount})
                    </button>
                </div>
            </div>

            {/* Orders */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>No orders found</h3>
                    <p>Try changing the filter or search term</p>
                </div>
            ) : (
                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Bill No</th>
                                <th>Customer</th>
                                <th>Phone</th>
                                <th>Order Date</th>
                                <th>Delivery</th>
                                <th>Blouses</th>
                                <th>Amount</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((order) => {
                                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                const balance =
                                    parseFloat(order.totalAmount || 0) - parseFloat(order.advanceAmount || 0);
                                return (
                                    <tr key={order.id} className="order-row" onClick={() => navigate(`/orders/${order.id}`)}>
                                        <td data-label="Bill No">
                                            <span className="bill-tag">{order.billNumber}</span>
                                        </td>
                                        <td className="customer-name-cell" data-label="Customer">{order.customer?.name}</td>
                                        <td data-label="Phone">{order.customer?.phone}</td>
                                        <td data-label="Order Date">{formatDate(order.orderDate)}</td>
                                        <td data-label="Delivery">{formatDate(order.deliveryDate)}</td>
                                        <td className="center-cell" data-label="Blouses">{order.blouses?.length || 0}</td>
                                        <td className="amount-cell" data-label="Amount">₹{order.totalAmount || 0}</td>
                                        <td className={balance > 0 ? 'balance-due-cell' : 'balance-zero-cell'} data-label="Balance">
                                            {balance > 0 ? (
                                                <button
                                                    className="btn-collect-sm"
                                                    onClick={(e) => { e.stopPropagation(); setCollectModal(order); }}
                                                >
                                                    💵 ₹{balance}
                                                </button>
                                            ) : (
                                                <span className="balance-zero-cell">✅ Paid</span>
                                            )}
                                        </td>
                                        <td data-label="Status" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                className="status-select-inline"
                                                value={order.status}
                                                style={{ background: cfg.bg, color: cfg.color }}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            >
                                                {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                                                    <option key={s} value={s}>
                                                        {c.icon} {c.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="btn-view"
                                                onClick={() => navigate(`/orders/${order.id}`)}
                                            >
                                                👁️ View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

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
