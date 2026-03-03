import { useRef, useState, useEffect, useCallback } from 'react';

const COLORS = [
    { hex: '#000000', label: 'Black' },
    { hex: '#8B1A4A', label: 'Rose' },
    { hex: '#1565C0', label: 'Blue' },
    { hex: '#2E7D32', label: 'Green' },
    { hex: '#E65100', label: 'Orange' },
    { hex: '#6A1B9A', label: 'Purple' },
    { hex: '#795548', label: 'Brown' },
    { hex: '#F44336', label: 'Red' },
];

const SIZES = [
    { val: 2, label: 'XS' },
    { val: 4, label: 'S' },
    { val: 8, label: 'M' },
    { val: 16, label: 'L' },
];

export default function SketchPad({ value, onChange }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#000000');
    const [size, setSize] = useState(4);
    const lastPos = useRef(null);
    const historyStack = useRef([]);
    const isInitialized = useRef(false);

    // Initialize canvas with white background
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    // Load saved sketch on mount
    useEffect(() => {
        initCanvas();
        if (value && canvasRef.current && !isInitialized.current) {
            isInitialized.current = true;
            const img = new Image();
            img.onload = () => {
                const ctx = canvasRef.current.getContext('2d');
                ctx.drawImage(img, 0, 0);
            };
            img.src = value;
        } else {
            isInitialized.current = true;
        }
    }, []);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if (e.touches && e.touches.length > 0) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const saveToHistory = () => {
        const canvas = canvasRef.current;
        if (historyStack.current.length >= 25) historyStack.current.shift();
        historyStack.current.push(canvas.toDataURL());
    };

    const startDraw = (e) => {
        e.preventDefault();
        saveToHistory();
        setIsDrawing(true);
        const pos = getPos(e);
        lastPos.current = pos;
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        const r = tool === 'eraser' ? size * 3 : size;
        ctx.arc(pos.x, pos.y, r / 2, 0, Math.PI * 2);
        ctx.fillStyle = tool === 'eraser' ? '#FFFFFF' : color;
        ctx.fill();
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing || !lastPos.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
        ctx.lineWidth = tool === 'eraser' ? size * 3 : size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        lastPos.current = pos;
    };

    const stopDraw = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        lastPos.current = null;
        if (onChange) onChange(canvasRef.current.toDataURL());
    };

    const handleUndo = () => {
        if (historyStack.current.length === 0) {
            initCanvas();
            if (onChange) onChange('');
            return;
        }
        const prev = historyStack.current.pop();
        const img = new Image();
        img.onload = () => {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(img, 0, 0);
            if (onChange) onChange(canvasRef.current.toDataURL());
        };
        img.src = prev;
    };

    const handleClear = () => {
        saveToHistory();
        initCanvas();
        if (onChange) onChange('');
    };

    return (
        <div className="sketch-pad">
            <div className="sketch-toolbar">
                {/* Tools */}
                <div className="toolbar-group">
                    <button
                        className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
                        onClick={() => setTool('pen')}
                    >
                        ✏️ Pen
                    </button>
                    <button
                        className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                        onClick={() => setTool('eraser')}
                    >
                        🧹 Eraser
                    </button>
                </div>

                {/* Colors */}
                <div className="toolbar-group colors-group">
                    {COLORS.map((c) => (
                        <button
                            key={c.hex}
                            className={`color-dot ${color === c.hex && tool === 'pen' ? 'active' : ''}`}
                            style={{ background: c.hex }}
                            title={c.label}
                            onClick={() => {
                                setColor(c.hex);
                                setTool('pen');
                            }}
                        />
                    ))}
                </div>

                {/* Sizes */}
                <div className="toolbar-group">
                    {SIZES.map((s) => (
                        <button
                            key={s.val}
                            className={`size-btn ${size === s.val ? 'active' : ''}`}
                            onClick={() => setSize(s.val)}
                            title={`${s.label} size`}
                        >
                            <span
                                style={{
                                    width: s.val * 2,
                                    height: s.val * 2,
                                    borderRadius: '50%',
                                    background: '#333',
                                    display: 'inline-block',
                                }}
                            />
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="toolbar-group">
                    <button className="tool-btn" onClick={handleUndo}>
                        ↩ Undo
                    </button>
                    <button className="tool-btn danger" onClick={handleClear}>
                        🗑️ Clear
                    </button>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width={900}
                height={420}
                className="sketch-canvas"
                style={{
                    touchAction: 'none',
                    cursor: tool === 'eraser' ? 'cell' : 'crosshair',
                }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
            />
            <p className="sketch-hint">
                💡 Tablet પર આંગળીથી ડ્રો કરો | Draw blouse design with finger on tablet
            </p>
        </div>
    );
}
