import { useEffect, useState, useRef, useCallback } from 'react'
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

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
    const [index, setIndex] = useState(startIndex)
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [dragging, setDragging] = useState(false)
    const dragStart = useRef(null)
    const imgRef = useRef(null)

    const MIN_ZOOM = 1
    const MAX_ZOOM = 5

    // Reset zoom/pan when changing image
    useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }) }, [index])

    // Keyboard controls
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') next()
            if (e.key === 'ArrowLeft') prev()
            if (e.key === '+') zoomIn()
            if (e.key === '-') zoomOut()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    })

    function next() { setIndex(i => (i + 1) % images.length); }
    function prev() { setIndex(i => (i - 1 + images.length) % images.length); }
    function zoomIn() { setZoom(z => Math.min(z + 0.5, MAX_ZOOM)) }
    function zoomOut() { setZoom(z => Math.max(z - 0.5, MIN_ZOOM)); if (zoom <= 1.5) setPan({ x: 0, y: 0 }) }
    function resetZoom() { setZoom(1); setPan({ x: 0, y: 0 }) }

    // Scroll to zoom
    function onWheel(e) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.3 : 0.3
        setZoom(z => Math.min(Math.max(z + delta, MIN_ZOOM), MAX_ZOOM))
    }

    // Drag to pan (only when zoomed)
    function onMouseDown(e) {
        if (zoom <= 1) return
        setDragging(true)
        dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    }
    function onMouseMove(e) {
        if (!dragging || !dragStart.current) return
        setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
    }
    function onMouseUp() { setDragging(false) }

    const current = images[index]

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            {/* Toolbar */}
            <div className="lightbox-toolbar" onClick={e => e.stopPropagation()}>
                <span className="lightbox-title">{current.label}</span>
                <div className="lightbox-controls">
                    <button className="lb-btn" onClick={zoomOut} title="Zoom out (-)">−</button>
                    <span className="lb-zoom-label" onClick={resetZoom} title="Click to reset">{Math.round(zoom * 100)}%</span>
                    <button className="lb-btn" onClick={zoomIn} title="Zoom in (+)">+</button>
                    <button className="lb-btn lb-close" onClick={onClose} title="Close (Esc)">✕</button>
                </div>
            </div>

            {/* Image stage */}
            <div
                className="lightbox-stage"
                onClick={e => e.stopPropagation()}
                onWheel={onWheel}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
            >
                <img
                    ref={imgRef}
                    src={current.url}
                    alt={current.label}
                    className="lightbox-img"
                    style={{
                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                        transition: dragging ? 'none' : 'transform 0.15s ease',
                    }}
                    draggable={false}
                />
            </div>

            {/* Prev / Next arrows (only if more than 1 image) */}
            {images.length > 1 && (
                <>
                    <button className="lb-arrow lb-arrow-left" onClick={e => { e.stopPropagation(); prev() }}>‹</button>
                    <button className="lb-arrow lb-arrow-right" onClick={e => { e.stopPropagation(); next() }}>›</button>
                    {/* Dots */}
                    <div className="lightbox-dots" onClick={e => e.stopPropagation()}>
                        {images.map((_, i) => (
                            <div key={i} className={`lb-dot ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} />
                        ))}
                    </div>
                </>
            )}

            {/* Hint */}
            <div className="lightbox-hint">Scroll to zoom · Drag to pan · Esc to close</div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Recommend() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [lightbox, setLightbox] = useState(null) // { images: [], startIndex: 0 }

    useEffect(() => {
        setLoading(true)
        axios.get(`${API}/api/recommend/${id}`)
            .then(r => setData(r.data))
            .catch(() => setError('Product not found.'))
            .finally(() => setLoading(false))
    }, [id])

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        document.body.style.overflow = lightbox ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [lightbox])

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

    // Build the list of all method images for lightbox navigation
    const methodImages = available
        .filter(m => m.method_image || product.image)
        .map(m => ({
            url: m.method_image ? getImageUrl(m.method_image) : imgUrl,
            label: m.method,
        }))

    function openLightbox(methodKey) {
        const idx = methodImages.findIndex((_, i) => {
            const m = available[i]
            return m.method_key === methodKey
        })
        setLightbox({ images: methodImages, startIndex: Math.max(0, idx) })
    }

    return (
        <div className="recommend-page">
            <button className="back-link btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
                ← Back to products
            </button>

            {/* PRODUCT HEADER */}
            <div className="recommend-header">
                {imgUrl ? (
                    <div className="recommend-header-img-wrap" onClick={() => setLightbox({ images: [{ url: imgUrl, label: product.name }], startIndex: 0 })} style={{ cursor: 'zoom-in' }}>
                        <img src={imgUrl} alt={product.name} className="recommend-header-img"
                            onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<div class="recommend-header-icon">${catIcon}</div>` }} />
                        <div className="lightbox-zoom-hint">🔍</div>
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
                            <MethodCard
                                key={m.method}
                                method={m}
                                productImg={imgUrl}
                                onImageClick={() => openLightbox(m.method_key)}
                            />
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
                            <MethodCard key={m.method} method={m} productImg={null} onImageClick={null} />
                        ))}
                    </div>
                </>
            )}

            {/* LIGHTBOX */}
            {lightbox && (
                <Lightbox
                    images={lightbox.images}
                    startIndex={lightbox.startIndex}
                    onClose={() => setLightbox(null)}
                />
            )}
        </div>
    )
}

// ─── Method Card ─────────────────────────────────────────────────────────────
function MethodCard({ method, productImg, onImageClick }) {
    const available = method.available
    const methodImgUrl = method.method_image ? getImageUrl(method.method_image) : null
    const displayImg = methodImgUrl || (available ? productImg : null)

    return (
        <div className={`method-card ${available ? 'available' : 'unavailable'}`} id={`method-${method.method_key}`}>
            {displayImg && (
                <div
                    className={`method-card-img-wrap ${onImageClick ? 'clickable' : ''}`}
                    onClick={onImageClick}
                    title={onImageClick ? 'Click to view full image' : ''}
                >
                    <img
                        src={displayImg}
                        alt={method.method}
                        className="method-card-img"
                        onError={e => e.target.parentElement.style.display = 'none'}
                    />
                    {onImageClick && <div className="method-card-img-zoom">🔍</div>}
                    <div className="method-card-img-badge">
                        {methodImgUrl ? `📷 ${method.method}` : '📦 Product'}
                    </div>
                </div>
            )}

            <div className="method-card-body">
                <div className="method-card-header">
                    <div className="method-card-title">
                        <div className="method-icon">{METHOD_ICONS[method.method] || '🖨️'}</div>
                        <h4>{method.method}</h4>
                    </div>
                    <div className={`avail-dot ${available ? 'yes' : 'no'}`} />
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
