import './FooterComp.css';

function FooterComp() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">© {currentYear} MovieDB. All rights reserved.</p>
        </div>

        <div className="footer-credit">
          <p className="footer-text tmdb-credit">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>

        <div className="footer-links">
          <a href="#privacy" className="footer-link">Privacy</a>
          <span className="footer-separator">•</span>
          <a href="#terms" className="footer-link">Terms</a>
          <span className="footer-separator">•</span>
          <a href="#contact" className="footer-link">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default FooterComp;
