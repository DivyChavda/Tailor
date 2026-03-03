export default function PaymentModal({
    order,
    paymentType,
    setPaymentType,
    partialAmount,
    setPartialAmount,
    onConfirm,
    onCancel,
}) {
    const total = parseFloat(order.totalAmount || 0);
    const advance = parseFloat(order.advanceAmount || 0);
    const balance = total - advance;
    const extra = parseFloat(partialAmount || 0);
    const newBalance = paymentType === 'full' ? 0 : Math.max(balance - extra, 0);

    return (
        <div className="modal-overlay no-print" onClick={onCancel}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-icon">💰</span>
                    <div>
                        <h2 className="modal-title">Payment Confirmation</h2>
                        <p className="modal-subtitle">ચુકવણી પુષ્ટિ — Marking as Delivered 🎁</p>
                    </div>
                </div>

                <div className="modal-amount-summary">
                    <div className="modal-amount-row">
                        <span>Total Bill / કુલ રકમ</span>
                        <span className="modal-total-value">₹{total}</span>
                    </div>
                    <div className="modal-amount-row">
                        <span>Already Paid / અગાઉ ભર્યા</span>
                        <span>₹{advance}</span>
                    </div>
                    <div className="modal-amount-row modal-balance-row">
                        <span>Balance Due / બાકી રકમ</span>
                        <span className="modal-balance-value">₹{balance}</span>
                    </div>
                </div>

                <div className="modal-payment-options">
                    <button
                        className={`modal-option-btn ${paymentType === 'full' ? 'active' : ''}`}
                        onClick={() => setPaymentType('full')}
                    >
                        <span className="option-icon">✅</span>
                        <div>
                            <div className="option-title">Full Payment Received</div>
                            <div className="option-sub">₹{balance} collected — Balance becomes ₹0</div>
                        </div>
                    </button>
                    <button
                        className={`modal-option-btn ${paymentType === 'partial' ? 'active' : ''}`}
                        onClick={() => setPaymentType('partial')}
                    >
                        <span className="option-icon">💵</span>
                        <div>
                            <div className="option-title">Partial Payment</div>
                            <div className="option-sub">Collect some amount, rest stays pending</div>
                        </div>
                    </button>
                </div>

                {paymentType === 'partial' && (
                    <div className="modal-partial-input">
                        <label className="field-label">Amount Received Now (₹) / અત્યારે ભરેલ</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="0"
                            value={partialAmount}
                            min="0"
                            max={balance}
                            onChange={(e) => setPartialAmount(e.target.value)}
                            autoFocus
                        />
                        {extra > 0 && (
                            <p className="modal-remaining-note">
                                Remaining balance after this payment: <strong>₹{newBalance}</strong>
                            </p>
                        )}
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-outline" onClick={onCancel}>✕ Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={onConfirm}
                        disabled={paymentType === 'partial' && !partialAmount}
                    >
                        🎁 Confirm & Mark Delivered
                    </button>
                </div>
            </div>
        </div>
    );
}
