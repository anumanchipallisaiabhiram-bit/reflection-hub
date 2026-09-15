import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { journalService } from "../services/api";

const JournalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await journalService.getJournalById(id);
        setJournal(data.journal);
      } catch (err) {
        setError(err.message || "Failed to load journal entry.");
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reflection? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      await journalService.deleteJournal(id);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to delete journal entry.");
      setDeleting(false);
    }
  };

  const handleGenerateAIReflection = async () => {
    try {
      setGeneratingAI(true);
      setAiError("");
      const data = await journalService.generateAIReflection(id);
      if (data.journal) {
        setJournal(data.journal);
      }
    } catch (err) {
      setAiError(err.message || "Failed to generate AI reflection.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMoodConfig = (mood) => {
    switch (mood) {
      case "Happy":
        return { label: "Happy", emoji: "😊", className: "badge-happy" };
      case "Excited":
        return { label: "Excited", emoji: "⚡", className: "badge-excited" };
      case "Calm":
        return { label: "Calm", emoji: "🌿", className: "badge-calm" };
      case "Sad":
        return { label: "Sad", emoji: "🌧️", className: "badge-sad" };
      case "Angry":
        return { label: "Angry", emoji: "🌋", className: "badge-angry" };
      default:
        return { label: "Neutral", emoji: "😐", className: "badge-neutral" };
    }
  };

  return (
    <div className="page-container detail-page-container">
      {/* Top Navigation Row */}
      <div className="detail-top-nav">
        <Link to="/" className="back-link">
          ← Back to Dashboard
        </Link>
        {journal && (
          <div className="action-buttons">
            <Link to={`/edit/${journal._id}`} className="btn btn-secondary btn-sm">
              ✏️ Edit
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "🗑️ Delete"}
            </button>
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="card loading-card text-center">
          <div className="spinner"></div>
          <p className="text-muted">Loading reflection details...</p>
        </div>
      ) : !journal ? (
        <div className="card empty-state-card text-center">
          <div className="empty-icon-circle">🔍</div>
          <h3>Journal Not Found</h3>
          <p className="text-muted">
            The requested reflection does not exist or you do not have permission to view it.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <>
          {/* Main Journal Entry Card */}
          <article className="card entry-detail-card">
            <header className="entry-header">
              <div className="entry-meta-row">
                <span className={`badge ${getMoodConfig(journal.mood).className}`}>
                  <span className="badge-emoji">{getMoodConfig(journal.mood).emoji}</span>{" "}
                  {getMoodConfig(journal.mood).label}
                </span>
                <time className="entry-datetime">{formatDate(journal.createdAt)}</time>
              </div>
              <h1 className="entry-title">{journal.title}</h1>
              {journal.updatedAt && journal.updatedAt !== journal.createdAt && (
                <div className="entry-edited-notice">
                  <span>Last edited on {formatDate(journal.updatedAt)}</span>
                </div>
              )}
            </header>

            <div className="entry-body-content">
              {journal.content}
            </div>
          </article>

          {/* AI Reflection Section */}
          <section className="card ai-reflection-card">
            <div className="ai-card-header">
              <div className="ai-title-group">
                <div className="ai-badge-icon">✨</div>
                <div>
                  <h3 className="ai-card-title">AI Reflection & Emotional Insights</h3>
                  <p className="ai-card-subtitle">
                    Personalized analysis and reflection questions powered by Gemini AI
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ai"
                onClick={handleGenerateAIReflection}
                disabled={generatingAI}
              >
                {generatingAI ? (
                  <>
                    <span className="spinner-sm"></span> Analyzing Entry...
                  </>
                ) : journal.aiReflection ? (
                  "🔄 Regenerate Insight"
                ) : (
                  "✨ Generate AI Reflection"
                )}
              </button>
            </div>

            {aiError && (
              <div className="alert alert-danger" style={{ marginTop: "1rem" }}>
                {aiError}
              </div>
            )}

            {journal.aiReflection ? (
              <div className="ai-reflection-body">
                <div className="markdown-content ai-markdown-wrapper">
                  <ReactMarkdown>{journal.aiReflection}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="ai-empty-prompt">
                <p className="text-muted">
                  Want a deeper perspective? Click <strong>"Generate AI Reflection"</strong> to analyze your emotional tone, summarize key takeaways, and get guided self-discovery prompts.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default JournalDetails;
