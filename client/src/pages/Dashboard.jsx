import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { journalService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MOOD_OPTIONS = [
  { value: "All", label: "All Moods", emoji: "🌈" },
  { value: "Happy", label: "Happy", emoji: "😊" },
  { value: "Calm", label: "Calm", emoji: "🌿" },
  { value: "Neutral", label: "Neutral", emoji: "😐" },
  { value: "Excited", label: "Excited", emoji: "⚡" },
  { value: "Sad", label: "Sad", emoji: "🌧️" },
  { value: "Angry", label: "Angry", emoji: "🌋" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await journalService.getJournals();
        setJournals(data.journals || []);
      } catch (err) {
        setError(err.message || "Failed to load journals");
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMoodConfig = (mood) => {
    switch (mood) {
      case "Happy":
        return { label: "Happy", emoji: "😊", className: "badge-happy", color: "#f59e0b" };
      case "Excited":
        return { label: "Excited", emoji: "⚡", className: "badge-excited", color: "#eab308" };
      case "Calm":
        return { label: "Calm", emoji: "🌿", className: "badge-calm", color: "#10b981" };
      case "Sad":
        return { label: "Sad", emoji: "🌧️", className: "badge-sad", color: "#0ea5e9" };
      case "Angry":
        return { label: "Angry", emoji: "🌋", className: "badge-angry", color: "#ef4444" };
      default:
        return { label: "Neutral", emoji: "😐", className: "badge-neutral", color: "#64748b" };
    }
  };

  // Filter and Sort Calculations
  const filteredJournals = useMemo(() => {
    return journals
      .filter((journal) => {
        const matchesMood =
          selectedMood === "All" || journal.mood === selectedMood;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          journal.title.toLowerCase().includes(query) ||
          journal.content.toLowerCase().includes(query);
        return matchesMood && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [journals, selectedMood, searchQuery, sortOrder]);

  // Insights Calculations
  const totalEntries = journals.length;
  const recentMood = journals.length > 0 ? getMoodConfig(journals[0].mood) : null;
  const totalAIReflections = journals.filter((j) => j.aiReflection).length;

  // Calculate Most Common Mood
  const moodFrequency = useMemo(() => {
    const counts = {};
    journals.forEach((j) => {
      const m = j.mood || "Neutral";
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  }, [journals]);

  const mostCommonMood = useMemo(() => {
    if (journals.length === 0) return null;
    let maxCount = 0;
    let dominantMood = "Neutral";
    Object.entries(moodFrequency).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    });
    return getMoodConfig(dominantMood);
  }, [moodFrequency, journals.length]);

  // Mood Distribution percentages for visual bar
  const moodDistribution = useMemo(() => {
    if (totalEntries === 0) return [];
    return Object.entries(moodFrequency).map(([mood, count]) => {
      const config = getMoodConfig(mood);
      const percentage = Math.round((count / totalEntries) * 100);
      return {
        mood,
        count,
        percentage,
        emoji: config.emoji,
        color: config.color,
      };
    });
  }, [moodFrequency, totalEntries]);

  const hasActiveFilters = searchQuery !== "" || selectedMood !== "All" || sortOrder !== "newest";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMood("All");
    setSortOrder("newest");
  };

  return (
    <div className="page-container">
      {/* Welcome Hero Banner */}
      <div className="dashboard-hero">
        <div className="hero-text-content">
          <div className="hero-greeting-pill">🌱 Daily Mindful Journal</div>
          <h1 className="hero-title">
            Welcome back, {user?.name || "Reflector"} <span className="wave-hand">👋</span>
          </h1>
          <p className="hero-subtitle">
            Take a moment to pause, reflect on your thoughts, and track your emotional growth.
          </p>
        </div>
        <div className="hero-action">
          <Link to="/create" className="btn btn-primary btn-lg">
            <span className="btn-icon">✏️</span> Write New Entry
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Analytics / Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">📝</div>
          <div className="stat-details">
            <span className="stat-value">{loading ? "..." : totalEntries}</span>
            <span className="stat-label">Total Reflections</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            {recentMood ? recentMood.emoji : "🎭"}
          </div>
          <div className="stat-details">
            <span className="stat-value">
              {loading ? "..." : recentMood ? recentMood.label : "None Yet"}
            </span>
            <span className="stat-label">Recent Mood</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            {mostCommonMood ? mostCommonMood.emoji : "📊"}
          </div>
          <div className="stat-details">
            <span className="stat-value">
              {loading ? "..." : mostCommonMood ? mostCommonMood.label : "None Yet"}
            </span>
            <span className="stat-label">Common Mood</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo">✨</div>
          <div className="stat-details">
            <span className="stat-value">{loading ? "..." : totalAIReflections}</span>
            <span className="stat-label">AI Reflections</span>
          </div>
        </div>
      </div>

      {/* Mood Distribution Visual Bar */}
      {!loading && totalEntries > 0 && moodDistribution.length > 0 && (
        <div className="card mood-distribution-card">
          <div className="mood-dist-header">
            <h3 className="mood-dist-title">Emotional Balance & Mood Trends</h3>
            <span className="mood-dist-caption">Based on {totalEntries} recorded reflection{totalEntries > 1 ? "s" : ""}</span>
          </div>
          <div className="mood-dist-bar-container">
            {moodDistribution.map((item) => (
              <div
                key={item.mood}
                className="mood-dist-bar-segment"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
                title={`${item.mood}: ${item.count} (${item.percentage}%)`}
              />
            ))}
          </div>
          <div className="mood-dist-legend">
            {moodDistribution.map((item) => (
              <div key={item.mood} className="mood-dist-legend-item">
                <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                <span className="legend-text">
                  {item.emoji} {item.mood} <span className="legend-percent">({item.percentage}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="card search-filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search reflections by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-controls-group">
          {/* Mood Filter Dropdown */}
          <div className="filter-select-wrapper">
            <label htmlFor="mood-filter" className="filter-label">Mood:</label>
            <select
              id="mood-filter"
              className="filter-select"
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
            >
              {MOOD_OPTIONS.map((mood) => (
                <option key={mood.value} value={mood.value}>
                  {mood.emoji} {mood.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order Selector */}
          <div className="filter-select-wrapper">
            <label htmlFor="sort-order" className="filter-label">Sort:</label>
            <select
              id="sort-order"
              className="filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">📅 Newest First</option>
              <option value="oldest">⏳ Oldest First</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm filter-reset-btn"
              onClick={clearFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Section Header with Active Results Count */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Your Journal Entries</h2>
          <p className="section-subtitle">
            {totalEntries === 0
              ? "No entries written yet"
              : hasActiveFilters
              ? `Showing ${filteredJournals.length} of ${totalEntries} entries`
              : `A chronological record of your ${totalEntries} reflection${totalEntries > 1 ? "s" : ""}`}
          </p>
        </div>
        {totalEntries > 0 && (
          <Link to="/chat" className="btn btn-outline-ai">
            🤖 Ask AI About Entries
          </Link>
        )}
      </div>

      {/* Journal Cards Feed */}
      {loading ? (
        <div className="card loading-card">
          <div className="spinner"></div>
          <p className="text-muted">Fetching your reflections...</p>
        </div>
      ) : totalEntries === 0 ? (
        <div className="card empty-state-card">
          <div className="empty-icon-circle">📖</div>
          <h3>Your journey starts with a single reflection</h3>
          <p className="text-muted">
            You haven't written any entries yet. Capture what's on your mind today and uncover patterns with AI.
          </p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            + Create Your First Journal
          </Link>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="card empty-state-card">
          <div className="empty-icon-circle">🔍</div>
          <h3>No matching reflections found</h3>
          <p className="text-muted">
            Try adjusting your search terms or mood filter to find what you're looking for.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearFilters}
            style={{ marginTop: "1rem" }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="journal-grid">
          {filteredJournals.map((journal) => {
            const moodInfo = getMoodConfig(journal.mood);
            return (
              <Link
                key={journal._id}
                to={`/journals/${journal._id}`}
                className="journal-card-link"
              >
                <div className="card journal-card">
                  <div className="journal-card-header">
                    <span className={`badge ${moodInfo.className}`}>
                      <span className="badge-emoji">{moodInfo.emoji}</span> {moodInfo.label}
                    </span>
                    <span className="journal-date">{formatDate(journal.createdAt)}</span>
                  </div>

                  <h3 className="journal-title">{journal.title}</h3>
                  <p className="journal-content text-preview">{journal.content}</p>

                  <div className="journal-card-footer">
                    <span className="view-entry-btn">
                      Read reflection <span className="arrow-icon">→</span>
                    </span>
                    {journal.aiReflection && (
                      <span className="ai-insight-tag" title="AI Reflection Generated">
                        ✨ AI Analyzed
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
