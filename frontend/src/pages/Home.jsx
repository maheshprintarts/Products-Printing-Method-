import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export const API = 'http://localhost:8000'

const CATEGORY_ICONS = {
    'Writing': '✏️',
    'Bags': '👜',
    'Drinkware': '☕',
    'Accessories': '🔑',
    'Stationery': '📒',
    'Tech Accessories': '📱',
    'Apparel': '👕',
    'Novelty': '🎯',
    'default': '📦',
}

export function getIcon(category) {
    return CATEGORY_ICONS[category] || CATEGORY_ICONS.default
}

export function getImageUrl(image) {
    if (!image) return null
    return `${API}/uploads/${image}`
}

function countMethods(product) {
    const fields = ['screen_printing', 'uv_printing', 'offset_printing', 'digital_printing',
        'laser_engraving', 'dtg_dtf', 'embroidery', 'sublimation']
    return fields.filter(f => product[f] && product[f].toUpperCase() !== 'NA').length
}

function SkeletonCard() {
    return (
        <div className="product-card">
            <div className="skeleton" style={{ width: '100%', height: 160, borderRadius: 8, marginBottom: 14 }} />
            <div className="skeleton" style={{ width: '75%', height: 16, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '50%', height: 12, marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 4 }}>
                <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 999 }} />
                <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 999 }} />
            </div>
        </div>
    )
}

export default function Home() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = {}
            if (search) params.search = search
            if (activeCategory !== 'All') params.category = activeCategory
            const res = await axios.get(`${API}/api/products`, { params })
            setProducts(res.data)
        } catch {
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [search, activeCategory])

    useEffect(() => {
        axios.get(`${API}/api/products/categories`).then(r => setCategories(r.data)).catch(() => { })
    }, [])

    useEffect(() => {
        const t = setTimeout(fetchProducts, 280)
        return () => clearTimeout(t)
    }, [fetchProducts])

    return (
        <div className="page">
            {/* HERO */}
            <section className="hero">
                <div className="hero-badge">🖨️ Smart Printing Recommendations</div>
                <h1>
                    Find the Right<br />
                    <span className="gradient-text">Printing Method</span>
                </h1>
                <p>
                    Select any promotional product and instantly discover compatible printing
                    techniques, color limits, and production timelines.
                </p>
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        id="product-search"
                        type="text"
                        placeholder="Search products... e.g. Mug, Pen, T-Shirt"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSearch('')}>✕</button>
                    )}
                </div>
                <div className="filter-pills">
                    {['All', ...categories].map(cat => (
                        <button
                            key={cat}
                            id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                            className={`pill ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat !== 'All' && getIcon(cat) + ' '}{cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* STATS */}
            <div className="stats-bar">
                <p>
                    {loading ? 'Loading...' : <><strong>{products.length}</strong> products found</>}
                </p>
                {(activeCategory !== 'All' || search) && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setActiveCategory('All'); setSearch('') }}>
                        ✕ Clear filters
                    </button>
                )}
            </div>

            {/* GRID */}
            <div className="product-grid">
                {loading
                    ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    : products.length === 0
                        ? (
                            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                                <div className="empty-icon">🔍</div>
                                <p>No products found.<br />Try a different search or category.</p>
                            </div>
                        )
                        : products.map(p => (
                            <div
                                key={p.id}
                                id={`product-${p.id}`}
                                className="product-card"
                                onClick={() => navigate(`/recommend/${p.id}`)}
                            >
                                {/* Product image or icon */}
                                {p.image ? (
                                    <div className="product-card-img-wrap">
                                        <img
                                            src={getImageUrl(p.image)}
                                            alt={p.name}
                                            className="product-card-img"
                                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                                        />
                                        <div className="product-card-icon" style={{ display: 'none' }}>{getIcon(p.category)}</div>
                                    </div>
                                ) : (
                                    <div className="product-card-icon">{getIcon(p.category)}</div>
                                )}

                                <h3>{p.name}</h3>
                                <div className="product-card-meta">
                                    <span className="badge badge-category">{p.category}</span>
                                    {p.material && <span className="badge badge-material">{p.material}</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span className="badge badge-count">
                                        {countMethods(p)} methods available
                                    </span>
                                    <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>View →</span>
                                </div>
                            </div>
                        ))
                }
            </div>
        </div>
    )
}
