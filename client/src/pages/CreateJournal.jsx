import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { journalService } from "../services/api";

const MOOD_OPTIONS = [
  { value: "Happy", label: "Happy", emoji: "😊" },
  { value: "Calm", label: "Calm", emoji: "🌿" },
  { value: "Neutral", label: "Neutral", emoji: "😐" },
  { value: "Excited", label: "Excited", emoji: "⚡" },
  { value: "Sad", label: "Sad", emoji: "🌧️" },
  { value: "Angry", label: "Angry", emoji: "🌋" },
];

const CreateJournal = () => {
  const [formData, setFormData] = useState({
    title: "",
    mood: "Neutral",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleMoodSelect = (moodValue) => {
    setFormData((prev) => ({
      ...prev,
      mood: moodValue,
    }));
  };

  // Live Word & Character Counts
  const { wordCount, charCount, dynamicTip } = useMemo(() => {
    const text = formData.content.trim();
    const chars = formData.content.length;
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;

    let tip = "💡 Start writing what's on your mind...";
    if (words > 0 && words <= 25) {
      tip = "✍️ Keep going — add a little more detail about how you felt.";
    } else if (words > 25 && words <= 100) {
      tip = "✨ Nice reflection. You're ready to save this entry.";
    } else if (words > 100) {
      tip = "🧠 You've shared a lot. Take a moment to review your thoughts.";
    }

    return { wordCount: words, charCount: chars, dynamicTip: tip };
  }, [formData.content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please provide both a title and content for your reflection.");
      return;
    }

    try {
      setLoading(true);
      await journalService.createJournal({
        title: formData.title.trim(),
        mood: formData.mood,
        content: formData.content.trim(),
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create journal entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container form-page-container">
      <div className="form-header">
        <Link to="/" className="back-link">
          ← Back to Dashboard
        </Link>
        <h1 className="form-page-title">Create New Reflection</h1>
        <p className="form-page-subtitle">
          Take a quiet moment to record your thoughts, feelings, and events of the day.
        </p>
      </div>

      <div className="card editor-card">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="journal-editor-form">
          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="title" className="editor-label">
              Reflection Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="editor-title-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your entry a title (e.g., Morning Thoughts, Learning New Skills...)"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Interactive Mood Selector */}
          <div className="form-group">
            <label className="editor-label">How are you feeling right now?</label>
            <div className="mood-selector-grid">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = formData.mood === mood.value;
                return (
                  <button
                    key={mood.value}
                    type="button"
                    className={`mood-select-pill ${isSelected ? "selected" : ""}`}
                    onClick={() => handleMoodSelect(mood.value)}
                    disabled={loading}
                  >
                    <span className="mood-select-emoji">{mood.emoji}</span>
                    <span className="mood-select-label">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Journal Content Textarea */}
          <div className="form-group">
            <label htmlFor="content" className="editor-label">
              Your Thoughts & Reflections
            </label>
            <textarea
              id="content"
              name="content"
              className="editor-textarea"
              value={formData.content}
              onChange={handleChange}
              rows="9"
              placeholder="Write freely without judgment... What happened today? What went well? What challenged you?"
              required
              disabled={loading}
            ></textarea>

            {/* Dynamic Writing Assistant Section */}
            <div className="writing-assistant-bar">
              <div className="assistant-tip-box">
                <span className="assistant-tip-text">{dynamicTip}</span>
              </div>
              <div className="assistant-stats-pill">
                <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
                <span className="stats-separator">·</span>
                <span>{charCount} {charCount === 1 ? "char" : "characters"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions-row">
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm"></span> Saving Reflection...
                </>
              ) : (
                "✨ Save Reflection"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJournal;
