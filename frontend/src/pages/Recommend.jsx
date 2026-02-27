import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API, getIcon, getImageUrl } from './Home'

const METHOD_ICONS = {
    'Screen Printing': '🖨️',
    'UV Printing': '💡',
    'Offset Printing': '📰',
    'Digital Printing': '🖥️',
    'Laser Engraving': '⚡',
    'DTG / DTF': '👕',
    'Embroidery': '🧵',
    'Sublimation': '🌈',
}

export default function Recommend() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        setLoading(true)
        axios.get(`${API}/api/recommend/${id}`)
            .then(r => setData(r.data))
            .catch(() => setError('Product not found.'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="recommend-page">
            <div className="spinner"><div className="spinner-ring" /></div>
        </div>
    )
    if (error) return (
        <div className="recommend-page">
            <div className="empty-state">
                <div className="empty-icon">⚠️</div>
                <p>{error}</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Back to Home</button>
            </div>
        </div>
    )

    const { product, methods } = data
    const available = methods.filter(m => m.available)
    const unavailable = methods.filter(m => !m.available)
    const catIcon = getIcon(product.category)
    const imgUrl = getImageUrl(product.image)

    return (
        <div className="recommend-page">
            <button className="back-link btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
                ← Back to products
            </button>

            {/* PRODUCT HEADER */}
            <div className="recommend-header">
                {imgUrl ? (
                    <div className="recommend-header-img-wrap">
                        <img src={imgUrl} alt={product.name} className="recommend-header-img"
                            onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<div class="recommend-header-icon">${catIcon}</div>` }} />
                    </div>
                ) : (
                    <div className="recommend-header-icon">{catIcon}</div>
                )}
                <div className="recommend-header-info">
                    <h2>{product.name}</h2>
                    <div className="meta-row">
                        <span className="badge badge-category">{product.category}</span>
                        {product.material && <span className="badge badge-material">🧱 {product.material}</span>}
                        <span className="badge badge-count">✅ {available.length} method{available.length !== 1 ? 's' : ''} available</span>
                    </div>
                </div>
            </div>

            {/* AVAILABLE METHODS */}
            {available.length > 0 && (
                <>
                    <div className="section-title">✅ Available Printing Methods ({available.length})</div>
                    <div className="methods-grid" style={{ marginBottom: 32 }}>
                        {available.map(m => (
                            <MethodCard key={m.method} method={m} productImg={imgUrl} available={true} />
                        ))}
                    </div>
                </>
            )}

            {/* UNAVAILABLE METHODS */}
            {unavailable.length > 0 && (
                <>
                    <div className="section-title">🚫 Not Applicable ({unavailable.length})</div>
                    <div className="methods-grid">
                        {unavailable.map(m => (
                            <MethodCard key={m.method} method={m} productImg={null} available={false} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

function MethodCard({ method, productImg, available }) {
    // Prefer method-specific image → fall back to product image → fall back to null
    const methodImgUrl = method.method_image ? getImageUrl(method.method_image) : null
    const displayImg = methodImgUrl || (available ? productImg : null)

    return (
        <div
            className={`method-card ${available ? 'available' : 'unavailable'}`}
            id={`method-${method.method_key}`}
        >
            {/* Method image — fills the top of the card, perfectly fitted */}
            {displayImg && (
                <div className="method-card-img-wrap">
                    <img
                        src={displayImg}
                        alt={method.method}
                        className="method-card-img"
                        onError={e => e.target.parentElement.style.display = 'none'}
                    />
                    {/* Overlay badge: "Method image" vs "Product image" */}
                    {available && (
                        <div className="method-card-img-badge">
                            {methodImgUrl ? `📷 ${method.method}` : '📦 Product'}
                        </div>
                    )}
                </div>
            )}

            {/* Card content */}
            <div className="method-card-body">
                <div className="method-card-header">
                    <div className="method-card-title">
                        <div className="method-icon">{METHOD_ICONS[method.method] || '🖨️'}</div>
                        <h4>{method.method}</h4>
                    </div>
                    <div className={`avail-dot ${available ? 'yes' : 'no'}`} title={available ? 'Available' : 'Not Applicable'} />
                </div>

                {available ? (
                    <>
                        {method.color_limit && <div className="method-color-limit">{method.color_limit}</div>}
                        {method.notes && <div className="method-notes">⚠️ {method.notes}</div>}
                        {method.production_time ? (
                            <div className="production-time-box">
                                <span className="time-icon">⏱️</span>
                                <span>{method.production_time}</span>
                            </div>
                        ) : (
                            <div className="production-time-box" style={{ opacity: 0.5 }}>
                                <span className="time-icon">⏱️</span>
                                <span>Production time varies</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="na-label">Not applicable for this product</div>
                )}
            </div>
        </div>
    )
}
