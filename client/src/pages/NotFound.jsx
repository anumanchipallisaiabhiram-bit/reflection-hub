import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="page-container center-card-page">
      <div className="card text-center empty-state-card">
        <div className="empty-icon-circle">🌌</div>
        <h2>404 - Page Not Found</h2>
        <p className="text-muted">
          The page or reflection you are searching for does not seem to exist.
        </p>
        <div style={{ marginTop: "1.25rem" }}>
          <Link to="/" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
