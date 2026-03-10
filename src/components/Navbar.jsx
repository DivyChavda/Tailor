import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const menuRef = useRef(null);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    return (
        <nav className="navbar no-print" ref={menuRef}>
            <div className="navbar-brand">
                <span className="brand-icon">✂️</span>
                <div className="brand-text">
                    <span className="brand-name">LADIES TAILOR SHOP</span>
                    <span className="brand-sub">ટેઈલર શોપ મેનેજમેન્ટ</span>
                </div>
            </div>

            {/* Desktop nav links */}
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

            {/* Hamburger button — mobile only */}
            <button
                className={`hamburger-btn${menuOpen ? ' open' : ''}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div className="mobile-menu">
                    <NavLink to="/" end className={({ isActive }) => 'mobile-nav-link' + (isActive ? ' active' : '')}>
                        <span className="nav-icon">🏠</span>
                        <span>Home</span>
                    </NavLink>
                    <NavLink to="/new-order" className={({ isActive }) => 'mobile-nav-link' + (isActive ? ' active' : '')}>
                        <span className="nav-icon">➕</span>
                        <span>New Order</span>
                    </NavLink>
                    <NavLink to="/orders" className={({ isActive }) => 'mobile-nav-link' + (isActive ? ' active' : '')}>
                        <span className="nav-icon">📋</span>
                        <span>Orders</span>
                    </NavLink>
                </div>
            )}
        </nav>
    );
}
