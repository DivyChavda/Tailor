import { useState } from 'react';

export default function CollectPaymentModal({ order, onConfirm, onCancel }) {
    const total = parseFloat(order.totalAmount || 0);
    const paid = parseFloat(order.advanceAmount || 0);
    const balance = total - paid;

    const [amount, setAmount] = useState(String(balance));
    const received = parseFloat(amount || 0);
    const newPaid = Math.min(paid + received, total);
    const remaining = total - newPaid;
    const isValid = received > 0 && received <= balance;

    return (
        <div className="modal-overlay no-print" onClick={onCancel}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <span className="modal-icon">💵</span>
                    <div>
                        <h2 className="modal-title">Collect Payment</h2>
                        <p className="modal-subtitle">
                            {order.customer?.name} &nbsp;·&nbsp;
                            <span className="bill-no-text">{order.billNumber}</span>
                        </p>
                    </div>
                </div>

                {/* Balance summary */}
                <div className="modal-amount-summary">
                    <div className="modal-amount-row">
                        <span>Total Bill / કુલ રકમ</span>
                        <span className="modal-total-value">₹{total}</span>
                    </div>
                    <div className="modal-amount-row">
                        <span>Already Collected / અગાઉ ભર્યા</span>
                        <span>₹{paid}</span>
                    </div>
                    <div className="modal-amount-row modal-balance-row">
                        <span>Balance Due / બાકી રકમ</span>
                        <span className="modal-balance-value">₹{balance}</span>
                    </div>
                </div>

                {/* Amount input */}
                <div className="collect-input-section">
                    <label className="field-label required">
                        Amount Received Now (₹) / અત્યારે ભરેલ
                    </label>
                    <input
                        type="number"
                        className={`form-input large-input ${!isValid && amount !== '' ? 'error' : ''}`}
                        placeholder={`Max ₹${balance}`}
                        value={amount}
                        min="1"
                        max={balance}
                        autoFocus
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    {amount !== '' && received > balance && (
                        <p className="field-error">Amount cannot exceed balance of ₹{balance}</p>
                    )}
                    {amount !== '' && received <= 0 && (
                        <p className="field-error">Please enter a valid amount</p>
                    )}
                </div>

                {/* Live preview */}
                {isValid && (
                    <div className="collect-preview">
                        <div className="collect-preview-row">
                            <span>After this payment:</span>
                            <span className="collect-preview-collected">Total Collected: ₹{newPaid}</span>
                        </div>
                        <div className="collect-preview-row">
                            <span>Remaining Balance:</span>
                            <span className={remaining === 0 ? 'collect-preview-cleared' : 'collect-preview-remaining'}>
                                {remaining === 0 ? '✅ Fully Paid!' : `₹${remaining} still due`}
                            </span>
                        </div>
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-outline" onClick={onCancel}>✕ Cancel</button>
                    <button
                        className="btn-primary"
                        disabled={!isValid}
                        onClick={() => onConfirm(newPaid)}
                    >
                        💵 Confirm ₹{isValid ? received : '—'} Received
                    </button>
                </div>
            </div>
        </div>
    );
}
