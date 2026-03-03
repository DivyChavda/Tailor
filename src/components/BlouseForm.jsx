import { useState } from 'react';
import MeasurementForm from './MeasurementForm';
import SketchPad from './SketchPad';
import GujaratiInput from './GujaratiInput';

const TABS = [
    { id: 'measurements', label: '📏 Measurements', gujarati: 'માપ' },
    { id: 'sketch', label: '✏️ Sketch', gujarati: 'સ્કેચ' },
    { id: 'notes', label: '📝 Design Notes', gujarati: 'ડિઝાઇન' },
];

export default function BlouseForm({ blouse, onUpdate, onRemove, canRemove, index }) {
    const [activeTab, setActiveTab] = useState('measurements');
    const [isExpanded, setIsExpanded] = useState(true);

    const update = (field, value) => onUpdate(blouse.id, { [field]: value });
    const updateMeasurements = (measurements) => onUpdate(blouse.id, { measurements });
    const updateUnit = (measurementUnit) => onUpdate(blouse.id, { measurementUnit });

    const hasSketch = blouse.sketchDataUrl && blouse.sketchDataUrl.length > 100;
    const hasMeasurements = Object.values(blouse.measurements).some((v) => v !== '');
    const hasNotes = blouse.designNotes && blouse.designNotes.trim().length > 0;

    return (
        <div className="blouse-form-card">
            {/* Blouse Header */}
            <div className="blouse-card-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="blouse-header-left">
                    <div className="blouse-number-badge">#{blouse.number}</div>
                    <div className="blouse-header-info">
                        <span className="blouse-title">Blouse {blouse.number}</span>
                        <span className="blouse-subtitle">
                            {blouse.fabric || blouse.color
                                ? `${blouse.fabric} ${blouse.color}`.trim()
                                : 'Click to fill details'}
                        </span>
                    </div>
                    <div className="blouse-indicators">
                        {hasMeasurements && <span className="indicator" title="Measurements added">📏</span>}
                        {hasSketch && <span className="indicator" title="Sketch added">✏️</span>}
                        {hasNotes && <span className="indicator" title="Notes added">📝</span>}
                    </div>
                </div>
                <div className="blouse-header-right">
                    {blouse.price && (
                        <span className="blouse-price-preview">₹{blouse.price}</span>
                    )}
                    {canRemove && (
                        <button
                            type="button"
                            className="remove-blouse-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(blouse.id);
                            }}
                        >
                            🗑️
                        </button>
                    )}
                    <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                </div>
            </div>

            {/* Blouse Content */}
            {isExpanded && (
                <div className="blouse-card-body">
                    {/* Fabric & Price Row */}
                    <div className="blouse-basic-row">
                        <div className="form-group">
                            <label className="field-label">
                                Fabric / Material <span className="gujarati-sub">(કાપડ)</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={blouse.fabric}
                                onChange={(e) => update('fabric', e.target.value)}
                                placeholder="e.g. Silk, Cotton, Georgette..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="field-label">
                                Color <span className="gujarati-sub">(રંગ)</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={blouse.color}
                                onChange={(e) => update('color', e.target.value)}
                                placeholder="e.g. Red, Blue, Golden..."
                            />
                        </div>
                        <div className="form-group price-group">
                            <label className="field-label">
                                Price (₹) <span className="gujarati-sub">(ભાવ)</span>
                            </label>
                            <input
                                type="number"
                                className="form-input price-input"
                                value={blouse.price}
                                onChange={(e) => update('price', e.target.value)}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="blouse-tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                                <span className="tab-gu">{tab.gujarati}</span>
                            </button>
                        ))}
                    </div>

                    <div className="tab-content">
                        {activeTab === 'measurements' && (
                            <MeasurementForm
                                measurements={blouse.measurements}
                                onChange={updateMeasurements}
                                unit={blouse.measurementUnit}
                                onUnitChange={updateUnit}
                            />
                        )}

                        {activeTab === 'sketch' && (
                            <SketchPad
                                value={blouse.sketchDataUrl}
                                onChange={(dataUrl) => update('sketchDataUrl', dataUrl)}
                            />
                        )}

                        {activeTab === 'notes' && (
                            <GujaratiInput
                                value={blouse.designNotes}
                                onChange={(text) => update('designNotes', text)}
                                placeholder="ડિઝાઇન વિશે નોંધ... (collar style, sleeve type, embroidery, lace...)"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
