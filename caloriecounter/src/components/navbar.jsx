import { Link } from "react-router-dom"
import "../css/navbar.css"

function NavBar(){
    return <nav className="navbar">
        <div className = "navbar-brand">
            <Link to = "/"> Movie App </Link>
        </div>
        <div className = "navbar-links">
            <Link to = "/" className="nav-link-home">Home</Link>
            <Link to = "/favourites" className="nav-link-favourites">Favourites</Link>
        </div>
    </nav>
}

export default NavBar