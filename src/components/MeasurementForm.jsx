const MEASUREMENTS = [
    { key: 'bust', label: 'Bust / Chest', gujarati: 'છાતી', icon: '📐' },
    { key: 'waist', label: 'Waist', gujarati: 'કમર', icon: '📐' },
    { key: 'shoulder', label: 'Shoulder', gujarati: 'ખભો', icon: '📐' },
    { key: 'blouseLength', label: 'Blouse Length', gujarati: 'બ્લાઉઝ લંબાઈ', icon: '📏' },
    { key: 'frontLength', label: 'Front Length', gujarati: 'આગળ', icon: '📏' },
    { key: 'backLength', label: 'Back Length', gujarati: 'પાછળ', icon: '📏' },
    { key: 'sleeveLength', label: 'Sleeve Length', gujarati: 'બાંય', icon: '📏' },
    { key: 'sleeveRound', label: 'Sleeve Round', gujarati: 'બાંય ઘેર', icon: '📐' },
    { key: 'armhole', label: 'Armhole', gujarati: 'બગલ', icon: '📐' },
    { key: 'neckFront', label: 'Neck Front', gujarati: 'ગળો આગળ', icon: '📏' },
    { key: 'neckBack', label: 'Neck Back', gujarati: 'ગળો પાછળ', icon: '📏' },
    { key: 'neckWidth', label: 'Neck Width', gujarati: 'ગળો ઘેર', icon: '📐' },
];

export default function MeasurementForm({ measurements, onChange, unit, onUnitChange }) {
    const handleChange = (key, val) => {
        onChange({ ...measurements, [key]: val });
    };

    return (
        <div className="measurement-form">
            <div className="measurement-form-header">
                <span className="section-title">📏 Measurements (માપ)</span>
                <div className="unit-toggle">
                    <button
                        type="button"
                        className={unit === 'in' ? 'unit-btn active' : 'unit-btn'}
                        onClick={() => onUnitChange('in')}
                    >
                        Inches
                    </button>
                    <button
                        type="button"
                        className={unit === 'cm' ? 'unit-btn active' : 'unit-btn'}
                        onClick={() => onUnitChange('cm')}
                    >
                        CM
                    </button>
                </div>
            </div>

            <div className="measurements-grid">
                {MEASUREMENTS.map((m) => (
                    <div key={m.key} className="measurement-item">
                        <label className="measurement-label">
                            <span className="m-en">{m.label}</span>
                            <span className="m-gu">{m.gujarati}</span>
                        </label>
                        <div className="measurement-input-row">
                            <input
                                type="number"
                                step="0.25"
                                min="0"
                                value={measurements[m.key] || ''}
                                onChange={(e) => handleChange(m.key, e.target.value)}
                                placeholder="0"
                                className="measurement-input"
                            />
                            <span className="measurement-unit">{unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export { MEASUREMENTS };
