import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:8000'

export default function Login() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await axios.post(`${API}/api/auth/login`, form)
            localStorage.setItem('token', res.data.access_token)
            navigate('/admin')
        } catch {
            setError('Invalid username or password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.6rem', margin: '0 auto 16px'
                    }}>🔐</div>
                </div>
                <h2>Admin Login</h2>
                <p>Sign in to manage the product database</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            id="login-username"
                            className="form-input"
                            type="text"
                            placeholder="admin"
                            value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            id="login-password"
                            className="form-input"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
                    <button id="login-submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
                        {loading ? '⏳ Signing in...' : '→ Sign In'}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Hint: admin / admin123
                </div>
            </div>
        </div>
    )
}
