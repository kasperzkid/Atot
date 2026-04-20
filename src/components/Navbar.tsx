import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  const getLink = (hash: string) => isHome ? hash : `/${hash}`;
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-visible' : ''}`}>
      <div className="nav-left">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="logo-text">Atot</span>
        </Link>
      </div>

      <div className={`mobile-overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}></div>

      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <li><a href={getLink("#home")} onClick={() => setIsMenuOpen(false)}>Home</a></li>
        <li><Link to="/find-us" onClick={() => setIsMenuOpen(false)}>Find Us</Link></li>
        <li><a href={getLink("#about")} onClick={() => setIsMenuOpen(false)}>About us</a></li>
        <li><a href={getLink("#menu")} onClick={() => setIsMenuOpen(false)}>Menu</a></li>
        <li><a href={getLink("#service")} onClick={() => setIsMenuOpen(false)}>Service</a></li>
        <li><a href={getLink("#contact")} onClick={() => setIsMenuOpen(false)}>Contact</a></li>
      </ul>

      <div className="nav-right">
        <Link to="/menu" className="btn-book rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-xl flex items-center gap-2 group">
          Book a table <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;