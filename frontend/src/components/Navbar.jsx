import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    function handleLogout() {
        localStorage.removeItem('token')
        navigate('/')
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">🖨️</div>
                    <div>
                        PrintSpec
                        <span>Recommendation System</span>
                    </div>
                </Link>
                <div className="navbar-actions">
                    {token ? (
                        <>
                            <Link to="/admin" className="btn btn-outline btn-sm">⚙️ Admin</Link>
                            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">🔐 Admin Login</Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
