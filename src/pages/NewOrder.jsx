import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlouseForm from '../components/BlouseForm';
import { saveOrder, generateBillNumber, createDefaultBlouse, todayString } from '../utils/db';

const STEPS = [
    { num: 1, label: 'Customer Info', gujarati: 'ગ્રાહક માહિતી', icon: '👩' },
    { num: 2, label: 'Blouse Details', gujarati: 'બ્લાઉઝ વિગત', icon: '👗' },
    { num: 3, label: 'Bill & Save', gujarati: 'બિલ & સેવ', icon: '🧾' },
];

function createInitialOrder() {
    return {
        id: crypto.randomUUID(),
        billNumber: generateBillNumber(),
        orderDate: todayString(),
        deliveryDate: '',
        status: 'pending',
        customer: { name: '', phone: '', address: '' },
        blouses: [createDefaultBlouse(1)],
        totalAmount: 0,
        advanceAmount: '',
        balanceAmount: 0,
        notes: '',
        createdAt: new Date().toISOString(),
    };
}

export default function NewOrder() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [order, setOrder] = useState(createInitialOrder);
    const [errors, setErrors] = useState({});
    const [saved, setSaved] = useState(false);

    /* ---------- Update helpers ---------- */
    const updateCustomer = (field, val) =>
        setOrder((prev) => ({ ...prev, customer: { ...prev.customer, [field]: val } }));

    const updateOrder = (field, val) => setOrder((prev) => ({ ...prev, [field]: val }));

    const updateBlouse = (id, updates) =>
        setOrder((prev) => ({
            ...prev,
            blouses: prev.blouses.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));

    const addBlouse = () => {
        if (order.blouses.length >= 8) return;
        const newBlouse = createDefaultBlouse(order.blouses.length + 1);
        setOrder((prev) => ({ ...prev, blouses: [...prev.blouses, newBlouse] }));
    };

    const removeBlouse = (id) => {
        if (order.blouses.length <= 1) return;
        setOrder((prev) => ({
            ...prev,
            blouses: prev.blouses
                .filter((b) => b.id !== id)
                .map((b, i) => ({ ...b, number: i + 1 })),
        }));
    };

    /* ---------- Validation ---------- */
    const validateStep1 = () => {
        const e = {};
        if (!order.customer.name.trim()) e.name = 'Customer name is required';
        if (!order.customer.phone.trim()) e.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(order.customer.phone.replace(/\s/g, '')))
            e.phone = 'Enter valid 10-digit phone number';
        if (!order.orderDate) e.orderDate = 'Order date is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ---------- Step navigation ---------- */
    const goNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2) {
            const total = order.blouses.reduce((s, b) => s + parseFloat(b.price || 0), 0);
            const advance = parseFloat(order.advanceAmount || 0);
            setOrder((prev) => ({
                ...prev,
                totalAmount: total,
                balanceAmount: total - advance,
            }));
        }
        setStep((s) => s + 1);
        window.scrollTo(0, 0);
    };

    const goBack = () => {
        setStep((s) => s - 1);
        window.scrollTo(0, 0);
    };

    /* ---------- Save ---------- */
    const handleSave = (printAfter = false) => {
        const advance = parseFloat(order.advanceAmount || 0);
        const total = order.totalAmount;
        const finalOrder = {
            ...order,
            advanceAmount: advance,
            balanceAmount: total - advance,
        };
        saveOrder(finalOrder);
        setSaved(true);
        setTimeout(() => {
            if (printAfter) {
                navigate(`/orders/${finalOrder.id}?print=bill`);
            } else {
                navigate(`/orders/${finalOrder.id}`);
            }
        }, 800);
    };

    const advanceVal = parseFloat(order.advanceAmount || 0);
    const totalVal = order.blouses.reduce((s, b) => s + parseFloat(b.price || 0), 0);
    const balanceVal = totalVal - advanceVal;

    return (
        <div className="page new-order-page">
            {/* Stepper */}
            <div className="stepper no-print">
                {STEPS.map((s, i) => (
                    <div key={s.num} className="stepper-item">
                        <div
                            className={`step-circle ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}
                        >
                            {step > s.num ? '✓' : s.icon}
                        </div>
                        <div className="step-label">
                            <span>{s.label}</span>
                            <span className="step-gu">{s.gujarati}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`step-line ${step > s.num ? 'done' : ''}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* =========== STEP 1: Customer Info =========== */}
            {step === 1 && (
                <div className="step-content">
                    <h2 className="step-heading">👩 Customer Information <span className="gu-heading">ગ્રાહક માહિતી</span></h2>

                    <div className="form-card">
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label className="field-label required">
                                    Customer Name <span className="gujarati-sub">(ગ્રાહકનું નામ)</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-input large-input ${errors.name ? 'error' : ''}`}
                                    value={order.customer.name}
                                    onChange={(e) => updateCustomer('name', e.target.value)}
                                    placeholder="Full Name..."
                                    autoFocus
                                />
                                {errors.name && <span className="field-error">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label className="field-label required">
                                    Phone Number <span className="gujarati-sub">(ફોન નંબર)</span>
                                </label>
                                <input
                                    type="tel"
                                    className={`form-input large-input ${errors.phone ? 'error' : ''}`}
                                    value={order.customer.phone}
                                    onChange={(e) => updateCustomer('phone', e.target.value)}
                                    placeholder="9876543210"
                                    maxLength={10}
                                />
                                {errors.phone && <span className="field-error">{errors.phone}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="field-label">
                                Address <span className="gujarati-sub">(સરનામું)</span>
                            </label>
                            <textarea
                                className="form-input form-textarea"
                                value={order.customer.address}
                                onChange={(e) => updateCustomer('address', e.target.value)}
                                placeholder="Street, Area, City..."
                                rows={2}
                            />
                        </div>

                        <div className="form-row two-col">
                            <div className="form-group">
                                <label className="field-label required">
                                    Order Date <span className="gujarati-sub">(ઓર્ડર તારીખ)</span>
                                </label>
                                <input
                                    type="date"
                                    className={`form-input large-input ${errors.orderDate ? 'error' : ''}`}
                                    value={order.orderDate}
                                    onChange={(e) => updateOrder('orderDate', e.target.value)}
                                />
                                {errors.orderDate && <span className="field-error">{errors.orderDate}</span>}
                            </div>

                            <div className="form-group">
                                <label className="field-label">
                                    Delivery Date <span className="gujarati-sub">(ડિલિવરી તારીખ)</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-input large-input"
                                    value={order.deliveryDate}
                                    onChange={(e) => updateOrder('deliveryDate', e.target.value)}
                                    min={order.orderDate}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="field-label">Bill Number</label>
                            <input
                                type="text"
                                className="form-input"
                                value={order.billNumber}
                                onChange={(e) => updateOrder('billNumber', e.target.value)}
                                style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--clr-primary)' }}
                            />
                        </div>
                    </div>

                    <div className="step-actions">
                        <span />
                        <button className="btn-primary large-btn" onClick={goNext}>
                            Next: Blouse Details →
                        </button>
                    </div>
                </div>
            )}

            {/* =========== STEP 2: Blouse Details =========== */}
            {step === 2 && (
                <div className="step-content">
                    <h2 className="step-heading">
                        👗 Blouse Details{' '}
                        <span className="gu-heading">બ્લાઉઝ વિગત</span>
                        <span className="blouse-count-badge">{order.blouses.length} Blouse(s)</span>
                    </h2>

                    <div className="blouses-list">
                        {order.blouses.map((blouse, idx) => (
                            <BlouseForm
                                key={blouse.id}
                                blouse={blouse}
                                index={idx}
                                onUpdate={updateBlouse}
                                onRemove={removeBlouse}
                                canRemove={order.blouses.length > 1}
                            />
                        ))}
                    </div>

                    {order.blouses.length < 8 && (
                        <button className="add-blouse-btn" type="button" onClick={addBlouse}>
                            ➕ Add Another Blouse <span className="gujarati-sub">(બીજું બ્લાઉઝ ઉમેરો)</span>
                        </button>
                    )}

                    <div className="step-actions">
                        <button className="btn-outline large-btn" onClick={goBack}>
                            ← Back
                        </button>
                        <button className="btn-primary large-btn" onClick={goNext}>
                            Next: Bill Summary →
                        </button>
                    </div>
                </div>
            )}

            {/* =========== STEP 3: Bill Summary =========== */}
            {step === 3 && (
                <div className="step-content">
                    <h2 className="step-heading">
                        🧾 Bill Summary <span className="gu-heading">બિલ સારાંશ</span>
                    </h2>

                    <div className="form-card bill-summary-card">
                        {/* Customer Preview */}
                        <div className="summary-customer">
                            <div className="summary-customer-info">
                                <strong>👩 {order.customer.name}</strong>
                                <span>📞 {order.customer.phone}</span>
                                {order.customer.address && <span>📍 {order.customer.address}</span>}
                            </div>
                            <div className="summary-dates">
                                <span>📅 Order: {order.orderDate}</span>
                                <span>🚚 Delivery: {order.deliveryDate || 'TBD'}</span>
                                <span className="bill-num">{order.billNumber}</span>
                            </div>
                        </div>

                        {/* Blouses Table */}
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Fabric / Color</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.blouses.map((b) => (
                                    <tr key={b.id}>
                                        <td>{b.number}</td>
                                        <td>
                                            {b.fabric || b.color
                                                ? `${b.fabric} ${b.color}`.trim()
                                                : `Blouse ${b.number}`}
                                        </td>
                                        <td className="amount-cell">₹{parseFloat(b.price || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="bill-totals">
                            <div className="total-row total-final">
                                <span>Total Amount (કુલ ભાવ)</span>
                                <span>₹{totalVal.toFixed(2)}</span>
                            </div>

                            <div className="total-row advance-row">
                                <label>
                                    Advance Paid <span className="gujarati-sub">(અગ્રિમ)</span>
                                </label>
                                <input
                                    type="number"
                                    className="advance-input"
                                    value={order.advanceAmount}
                                    min={0}
                                    max={totalVal}
                                    onChange={(e) => {
                                        const adv = parseFloat(e.target.value || 0);
                                        setOrder((prev) => ({
                                            ...prev,
                                            advanceAmount: e.target.value,
                                            balanceAmount: totalVal - adv,
                                        }));
                                    }}
                                    placeholder="0"
                                />
                            </div>

                            <div className="total-row balance-row">
                                <span>Balance Due <span className="gujarati-sub">(બાકી)</span></span>
                                <span className={balanceVal > 0 ? 'balance-due' : 'balance-zero'}>
                                    ₹{balanceVal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label className="field-label">
                                Additional Notes <span className="gujarati-sub">(નોંધ)</span>
                            </label>
                            <textarea
                                className="form-input form-textarea"
                                value={order.notes}
                                onChange={(e) => updateOrder('notes', e.target.value)}
                                placeholder="Any special instructions..."
                                rows={2}
                            />
                        </div>
                    </div>

                    {saved && (
                        <div className="save-success">✅ Order saved successfully! Redirecting...</div>
                    )}

                    <div className="step-actions save-actions">
                        <button className="btn-outline large-btn" onClick={goBack} disabled={saved}>
                            ← Back
                        </button>
                        <button
                            className="btn-outline large-btn"
                            onClick={() => handleSave(false)}
                            disabled={saved}
                        >
                            💾 Save Order
                        </button>
                        <button
                            className="btn-primary large-btn"
                            onClick={() => handleSave(true)}
                            disabled={saved}
                        >
                            💾 Save & Print Bill 🖨️
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
