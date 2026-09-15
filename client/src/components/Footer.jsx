import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">📖 Reflection Hub</span>
          <span className="footer-tagline">AI-Powered Mindful Journaling</span>
        </div>
        <div className="footer-meta">
          <p>&copy; {new Date().getFullYear()} Reflection Hub. Your private digital sanctuary.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
