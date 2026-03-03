import { NavLink } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="navbar no-print">
            <div className="navbar-brand">
                <span className="brand-icon">✂️</span>
                <div className="brand-text">
                    <span className="brand-name">LADIES TAILOR SHOP</span>
                    <span className="brand-sub">ટેઈલર શોપ મેનેજમેન્ટ</span>
                </div>
            </div>
            <div className="navbar-links">
                <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Home</span>
                </NavLink>
                <NavLink to="/new-order" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                    <span className="nav-icon">➕</span>
                    <span className="nav-label">New Order</span>
                </NavLink>
                <NavLink to="/orders" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                    <span className="nav-icon">📋</span>
                    <span className="nav-label">Orders</span>
                </NavLink>
            </div>
        </nav>
    );
}
