import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-text">MovieHUB</span>
                </Link>

                <form className="search-container" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search movies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">
                        <p>Search</p>
                    </button>
                </form>

                {/* <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-link">
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <a href="#trending" className="nav-link">
                            Trending
                        </a>
                    </li>
                    <li className="nav-item">
                        <a href="#popular" className="nav-link">
                            Popular
                        </a>
                    </li>
                </ul> */}
            </div>
        </nav>
    );
}

export default NavBar;
