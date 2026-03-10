const ORDERS_KEY = 'tailor_orders';

export function generateBillNumber() {
    const orders = getAllOrders();
    const num = String(orders.length + 1).padStart(3, '0');
    return `TS-${num}`;
}

export function getAllOrders() {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveOrder(order) {
    const orders = getAllOrders();
    const idx = orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
        orders[idx] = order;
    } else {
        orders.unshift(order);
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return order;
}

export function getOrderById(id) {
    return getAllOrders().find((o) => o.id === id) || null;
}

export function deleteOrder(id) {
    const orders = getAllOrders().filter((o) => o.id !== id);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function updateOrderStatus(id, status) {
    const orders = getAllOrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
}

export function updateOrderPayment(id, newAdvanceAmount) {
    const orders = getAllOrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
        order.advanceAmount = newAdvanceAmount;
        order.updatedAt = new Date().toISOString();
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
}

export function getStats() {
    const orders = getAllOrders();
    // Revenue = money actually collected (sum of advanceAmount across all orders)
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.advanceAmount || 0), 0);
    // Receivable = pending balances across all orders
    const totalReceivable = orders.reduce((sum, o) => {
        const bal = parseFloat(o.totalAmount || 0) - parseFloat(o.advanceAmount || 0);
        return sum + (bal > 0 ? bal : 0);
    }, 0);
    return {
        total: orders.length,
        pending: orders.filter((o) => o.status === 'pending').length,
        stitching: orders.filter((o) => o.status === 'stitching').length,
        ready: orders.filter((o) => o.status === 'ready').length,
        delivered: orders.filter((o) => o.status === 'delivered').length,
        totalRevenue,
        totalReceivable,
    };
}

export function createDefaultBlouse(num) {
    return {
        id: crypto.randomUUID(),
        number: num,
        fabric: '',
        color: '',
        designNotes: '',
        measurements: {
            bust: '',
            waist: '',
            shoulder: '',
            blouseLength: '',
            frontLength: '',
            backLength: '',
            sleeveLength: '',
            sleeveRound: '',
            armhole: '',
            neckFront: '',
            neckBack: '',
            neckWidth: '',
        },
        measurementUnit: 'in',
        price: '',
        sketchDataUrl: '',
    };
}

export function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function todayString() {
    return new Date().toISOString().split('T')[0];
}

export function sendWhatsAppReady(order) {
    const digits = (order.customer?.phone || '').replace(/\D/g, '').slice(-10);
    if (!digits || digits.length < 10) return;
    const phone = '91' + digits;
    const name = order.customer?.name || 'ગ્રાહક';
    const total = parseFloat(order.totalAmount || 0);
    const advance = parseFloat(order.advanceAmount || 0);
    const balance = total - advance;
    const balanceText = balance > 0
        ? `\n💰 બાકી રકમ: ₹${balance}`
        : '\n✅ સંપૂર્ણ ચૂકવ્યું';
    const blouseCount = order.blouses?.length || 0;
    const msg =
        `નમસ્તે ${name}! 🙏\n\n` +
        `આપનો ઓર્ડર તૈયાર છે! ✅\n\n` +
        `📋 Bill No: ${order.billNumber}\n` +
        `👗 Blouses: ${blouseCount}\n` +
        `💵 Total: ₹${total}` +
        `${balanceText}\n\n` +
        `કૃપા કરી અમારી દુકાને આવી આપનો ઓર્ડર લઈ જાઓ.\n\n` +
        `✂️ Ladies Tailor Shop`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}
