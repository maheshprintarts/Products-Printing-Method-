import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API, getImageUrl } from './Home'

const METHODS = [
    { key: 'screen_printing', label: 'Screen Printing', icon: '🖨️' },
    { key: 'uv_printing', label: 'UV Printing', icon: '💡' },
    { key: 'offset_printing', label: 'Offset Printing', icon: '📰' },
    { key: 'digital_printing', label: 'Digital Printing', icon: '🖥️' },
    { key: 'laser_engraving', label: 'Laser Engraving', icon: '⚡' },
    { key: 'dtg_dtf', label: 'DTG / DTF', icon: '👕' },
    { key: 'embroidery', label: 'Embroidery', icon: '🧵' },
    { key: 'sublimation', label: 'Sublimation', icon: '🌈' },
]

const EMPTY_FORM = {
    name: '', category: '', material: '',
    screen_printing: 'NA', uv_printing: 'NA', offset_printing: 'NA',
    digital_printing: 'NA', laser_engraving: 'NA', dtg_dtf: 'NA',
    embroidery: 'NA', sublimation: 'NA', production_time: '', image: null,
}

function Toast({ toast, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
    if (!toast) return null
    return (
        <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span>{toast.message}</span>
        </div>
    )
}

// ─── Generic image uploader (for main product image) ──────────────────────
function ImageUploader({ productId, currentImage, onUploaded }) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(currentImage ? getImageUrl(currentImage) : null)
    const [dragOver, setDragOver] = useState(false)
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }

    async function handleFile(file) {
        if (!file) return
        setPreview(URL.createObjectURL(file))
        setUploading(true)
        const fd = new FormData(); fd.append('file', file)
        try {
            const res = await axios.post(`${API}/api/products/${productId}/upload-image`, fd,
                { headers: { ...headers, 'Content-Type': 'multipart/form-data' } })
            onUploaded(res.data.image)
        } catch { setPreview(currentImage ? getImageUrl(currentImage) : null); alert('Upload failed.') }
        finally { setUploading(false) }
    }

    async function handleRemove() {
        setUploading(true)
        try { await axios.delete(`${API}/api/products/${productId}/image`, { headers }); setPreview(null); onUploaded(null) }
        catch { alert('Remove failed.') } finally { setUploading(false) }
    }

    return (
        <div className="image-uploader">
            {preview ? (
                <div className="image-preview-wrap">
                    <img src={preview} alt="Product" className="image-preview" />
                    <div className="image-preview-actions">
                        <label className="btn btn-primary btn-sm upload-label" style={{ cursor: 'pointer' }}>
                            {uploading ? '⏳' : '🔄 Change'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} disabled={uploading} />
                        </label>
                        <button className="btn btn-danger btn-sm" onClick={handleRemove} disabled={uploading}>🗑️</button>
                    </div>
                </div>
            ) : (
                <label className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} disabled={uploading} />
                    <div className="upload-dropzone-icon">{uploading ? '⏳' : '📷'}</div>
                    <div className="upload-dropzone-label">{uploading ? 'Uploading...' : 'Click or drag & drop'}</div>
                    <div className="upload-dropzone-hint">JPG, PNG, WEBP — max 5 MB</div>
                </label>
            )}
        </div>
    )
}

// ─── Per-method image uploader ──────────────────────────────────────────────
function MethodImageUploader({ productId, methodKey, methodLabel, methodIcon, currentImage, onUploaded }) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(currentImage ? getImageUrl(currentImage) : null)
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }

    async function handleFile(file) {
        if (!file) return
        setPreview(URL.createObjectURL(file))
        setUploading(true)
        const fd = new FormData(); fd.append('file', file)
        try {
            const res = await axios.post(`${API}/api/products/${productId}/method-image/${methodKey}`, fd,
                { headers: { ...headers, 'Content-Type': 'multipart/form-data' } })
            onUploaded(methodKey, res.data.image)
        } catch { setPreview(currentImage ? getImageUrl(currentImage) : null); alert(`Upload failed for ${methodLabel}`) }
        finally { setUploading(false) }
    }

    async function handleRemove(e) {
        e.stopPropagation()
        setUploading(true)
        try {
            await axios.delete(`${API}/api/products/${productId}/method-image/${methodKey}`, { headers })
            setPreview(null); onUploaded(methodKey, null)
        } catch { alert('Remove failed.') } finally { setUploading(false) }
    }

    return (
        <div className="method-img-uploader">
            <div className="method-img-uploader-label">
                <span className="method-img-uploader-icon">{methodIcon}</span>
                <span>{methodLabel}</span>
            </div>
            {preview ? (
                <div className="method-img-preview-wrap">
                    <img src={preview} alt={methodLabel} className="method-img-preview" onError={e => e.target.style.display = 'none'} />
                    <div className="method-img-preview-overlay">
                        <label className="btn btn-primary btn-sm upload-label" style={{ cursor: 'pointer', fontSize: '0.72rem', padding: '4px 10px' }}>
                            {uploading ? '⏳' : '🔄'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} disabled={uploading} />
                        </label>
                        <button className="btn btn-danger btn-sm" style={{ fontSize: '0.72rem', padding: '4px 8px' }} onClick={handleRemove} disabled={uploading}>🗑️</button>
                    </div>
                </div>
            ) : (
                <label className="method-img-dropzone">
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} disabled={uploading} />
                    {uploading ? <span>⏳</span> : <><span>+</span><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Upload</span></>}
                </label>
            )}
        </div>
    )
}

export default function Admin() {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editProduct, setEditProduct] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [activeSection, setActiveSection] = useState('details') // 'details' | 'images'

    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    function showToast(message, type = 'success') { setToast({ message, type }) }

    async function fetchProducts() {
        setLoading(true)
        try {
            const params = search ? { search } : {}
            const res = await axios.get(`${API}/api/products`, { params })
            setProducts(res.data)
        } catch { showToast('Failed to load.', 'error') }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchProducts() }, [search])

    function openCreate() { setEditProduct(null); setForm(EMPTY_FORM); setActiveSection('details'); setShowModal(true) }

    function openEdit(p) {
        setEditProduct(p)
        setForm({
            name: p.name, category: p.category, material: p.material || '',
            screen_printing: p.screen_printing || 'NA', uv_printing: p.uv_printing || 'NA',
            offset_printing: p.offset_printing || 'NA', digital_printing: p.digital_printing || 'NA',
            laser_engraving: p.laser_engraving || 'NA', dtg_dtf: p.dtg_dtf || 'NA',
            embroidery: p.embroidery || 'NA', sublimation: p.sublimation || 'NA',
            production_time: p.production_time || '', image: p.image || null,
        })
        setActiveSection('details')
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault(); setSaving(true)
        try {
            if (editProduct) {
                await axios.put(`${API}/api/products/${editProduct.id}`, form, { headers })
                showToast('Product updated!')
            } else {
                await axios.post(`${API}/api/products`, form, { headers })
                showToast('Created! Open Edit to add images.')
            }
            setShowModal(false); fetchProducts()
        } catch { showToast('Failed to save.', 'error') }
        finally { setSaving(false) }
    }

    function isAvailable(val) { return val && val.trim().toUpperCase() !== 'NA' }

    // Get available methods for this product
    const availableMethods = editProduct
        ? METHODS.filter(m => isAvailable(editProduct[m.key]))
        : []

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h2>⚙️ Admin Panel</h2>
                    <p>Manage products, printing specs, and images</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Home</button>
                    <button id="add-product-btn" className="btn btn-primary btn-sm" onClick={openCreate}>+ Add Product</button>
                </div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <div className="search-bar" style={{ maxWidth: 'none', margin: 0 }}>
                    <span className="search-icon">🔍</span>
                    <input id="admin-search" type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="spinner"><div className="spinner-ring" /></div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Image</th><th>#</th><th>Product</th><th>Category</th>
                                <th>Material</th><th>Methods Active</th><th>Production Time</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        {p.image
                                            ? <img src={getImageUrl(p.image)} alt={p.name} className="table-product-img" onError={e => e.target.style.display = 'none'} />
                                            : <div className="table-product-img-placeholder">📦</div>}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.id}</td>
                                    <td><strong>{p.name}</strong></td>
                                    <td><span className="badge badge-category">{p.category}</span></td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{p.material || '—'}</td>
                                    <td><div className="method-dots">{METHODS.map(m => (
                                        <div key={m.key} className={`method-dot ${isAvailable(p[m.key]) ? 'active' : ''}`} title={`${m.label}: ${p[m.key] || 'NA'}`} />
                                    ))}</div></td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {p.production_time ? p.production_time.split('\n')[0] + (p.production_time.includes('\n') ? '...' : '') : '—'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button id={`edit-${p.id}`} className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                                            <button id={`delete-${p.id}`} className="btn btn-danger btn-sm" onClick={() => setDeleteId(p.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editProduct ? `✏️ ${editProduct.name}` : '➕ Add Product'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {/* TABS */}
                        {editProduct && (
                            <div className="modal-tabs">
                                <button className={`modal-tab ${activeSection === 'details' ? 'active' : ''}`} onClick={() => setActiveSection('details')}>📋 Details & Specs</button>
                                <button className={`modal-tab ${activeSection === 'images' ? 'active' : ''}`} onClick={() => setActiveSection('images')}>🖼️ Images</button>
                            </div>
                        )}

                        {/* ── DETAILS TAB ── */}
                        {activeSection === 'details' && (
                            <form onSubmit={handleSubmit}>
                                {!editProduct && (
                                    <div className="form-info-note">💡 After creating, open <strong>Edit → Images</strong> to upload product &amp; method images.</div>
                                )}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Product Name *</label>
                                        <input id="form-name" className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mug (Ceramic)" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category *</label>
                                        <input id="form-category" className="form-input" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Drinkware" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Material</label>
                                    <input id="form-material" className="form-input" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} placeholder="e.g. Ceramic, Metal, Plastic" />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <div className="form-label" style={{ marginBottom: 10 }}>Printing Methods (use "NA" for not applicable, or enter color count / note)</div>
                                    <div className="form-row">
                                        {METHODS.map(m => (
                                            <div className="form-group" key={m.key}>
                                                <label className="form-label">{m.icon} {m.label}</label>
                                                <input id={`form-${m.key}`} className="form-input" value={form[m.key]} onChange={e => setForm({ ...form, [m.key]: e.target.value })} placeholder="NA" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Production Time (one line per method)</label>
                                    <textarea id="form-production-time" className="form-input" rows={4} value={form.production_time}
                                        onChange={e => setForm({ ...form, production_time: e.target.value })}
                                        placeholder={"Screen Printing (Qty 100) = 5 working days\nUV Printing (Qty 100) = 4 working days"} style={{ resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button id="form-save" type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? '⏳ Saving...' : (editProduct ? '✅ Update' : '➕ Create')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── IMAGES TAB ── */}
                        {activeSection === 'images' && editProduct && (
                            <div>
                                {/* Main product image */}
                                <div className="form-group">
                                    <label className="form-label">📷 Main Product Image</label>
                                    <ImageUploader
                                        productId={editProduct.id}
                                        currentImage={form.image}
                                        onUploaded={img => { setForm(f => ({ ...f, image: img })); fetchProducts() }}
                                    />
                                </div>

                                {/* Per-method images */}
                                {availableMethods.length > 0 && (
                                    <>
                                        <div className="section-title" style={{ marginTop: 20 }}>🖨️ Printing Method Images</div>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                                            Upload a separate image for each available printing method. This image will appear on the method card in the recommendation page.
                                        </p>
                                        <div className="method-img-grid">
                                            {availableMethods.map(m => (
                                                <MethodImageUploader
                                                    key={m.key}
                                                    productId={editProduct.id}
                                                    methodKey={m.key}
                                                    methodLabel={m.label}
                                                    methodIcon={m.icon}
                                                    currentImage={editProduct[`${m.key}_image`]}
                                                    onUploaded={(key, img) => {
                                                        // Update editProduct ref so uploader shows correct state
                                                        editProduct[`${key}_image`] = img
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {availableMethods.length === 0 && (
                                    <div className="form-info-note" style={{ marginTop: 16 }}>
                                        ⚠️ No available printing methods set for this product. Update specs in the Details tab first.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM */}
            {deleteId && (
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
                            <h3 style={{ marginBottom: 8 }}>Delete Product?</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>This action cannot be undone.</p>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
                                <button id="confirm-delete" className="btn btn-danger" onClick={async () => {
                                    try { await axios.delete(`${API}/api/products/${deleteId}`, { headers }); showToast('Deleted.'); setDeleteId(null); fetchProducts() }
                                    catch { showToast('Failed.', 'error') }
                                }}>Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    )
}
