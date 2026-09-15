import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { journalService } from "../services/api";

const STARTER_PROMPTS = [
  "What moods have I experienced lately?",
  "What progress have I made in my entries?",
  "What recurring themes appear in my journals?",
  "Summarize my recent reflections",
];

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your **Reflection Assistant**. I can help you explore your past thoughts, discover emotional patterns, and track milestones recorded in your journal entries. What would you like to explore today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || loading) return;

    const userMessageObj = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setInputMessage("");
    setError("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 1)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const data = await journalService.sendAIChatMessage(text.trim(), history);

      const aiMessageObj = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.reply || "I couldn't process a response at this time.",
      };

      setMessages((prev) => [...prev, aiMessageObj]);
    } catch (err) {
      setError(err.message || "Failed to communicate with AI Assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="page-container chat-page-container">
      {/* Header */}
      <div className="chat-page-header">
        <div className="chat-header-badge">
          <span className="chat-header-icon">🤖</span>
          <div>
            <h1 className="chat-title">AI Journal Companion</h1>
            <p className="chat-subtitle">
              Ask questions and uncover insights based strictly on your private reflections
            </p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Main Chat Interface */}
      <div className="card chat-box">
        {/* Messages Feed */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.sender === "user" ? "message-user" : "message-ai"}`}
            >
              <div className="message-header">
                <span className="message-avatar">
                  {msg.sender === "user" ? "👤 You" : "✨ Assistant"}
                </span>
              </div>
              <div className="message-body">
                {msg.sender === "ai" ? (
                  <div className="markdown-content">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="user-text-content">{msg.text}</div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message message-ai message-loading">
              <div className="message-header">
                <span className="message-avatar">✨ Assistant</span>
              </div>
              <div className="message-body">
                <div className="ai-thinking-row">
                  <span className="spinner-ai"></span>
                  <span className="pulse-dot">Searching and analyzing your journals...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starter Chips */}
        {messages.length <= 2 && (
          <div className="starter-prompts-bar">
            <span className="starter-label">Suggested:</span>
            <div className="prompt-chips">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="chip"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask about your past moods, progress, struggles, or topics..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-ai chat-send-btn"
            disabled={loading || !inputMessage.trim()}
          >
            {loading ? "Thinking..." : "Send →"}
          </button>
        </form>
      </div>

      <div className="chat-privacy-notice">
        🔒 Your journal entries are kept strictly private and used only for your own conversation context.
      </div>
    </div>
  );
};

export default AIChat;
