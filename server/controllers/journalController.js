const Journal = require("../models/Journal");

// Create Journal
const createJournal = async (req, res) => {
  try {
    const { title, content, mood } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const journal = await Journal.create({
      user: req.user.id,
      title,
      content,
      mood,
    });

    res.status(201).json({
      success: true,
      message: "Journal created successfully",
      journal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Journals for Authenticated User
const getJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: journals.length,
      journals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Journal by ID
const getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    res.status(200).json({
      success: true,
      journal,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Journal
const updateJournal = async (req, res) => {
  try {
    const updates = {};
    const allowedFields = ["title", "content", "mood"];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    res.json({
      success: true,
      journal,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Journal
const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Journal deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Generate AI Reflection
const generateAIReflection = async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    let reflectionText = "";

    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenAI } = require("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `You are an empathetic, insightful personal reflection guide for Reflection Hub. Analyze this journal entry:

Title: ${journal.title}
Mood: ${journal.mood}
Content: ${journal.content}

Provide a warm, supportive, structured reflection:
1. **Summary & Emotional Insight**: A brief, compassionate reflection on what was written.
2. **Key Takeaways**: 2-3 bullet points highlighting core themes.
3. **Reflection Prompts**: 2 thoughtful questions to help the writer process their thoughts further.`,
      });
      reflectionText = response.text;
    } else {
      reflectionText = `### 🌟 AI Reflection Insight

**Summary & Emotional Insight:**
Your entry **"${journal.title}"** captures a moment of expression with a **${journal.mood}** tone. Taking time to write out your thoughts is a valuable practice for clarity and self-awareness.

**Key Takeaways:**
- You expressed your feelings directly regarding *"${journal.title}"*.
- Journaling helps process complex emotions and track personal growth over time.

**Reflection Prompts:**
1. What was the most significant trigger or highlight behind this entry?
2. What is one small action or shift in perspective you can take moving forward?

*(Note: Set GEMINI_API_KEY in server/.env for live Google Gemini AI model generation)*`;
    }

    journal.aiReflection = reflectionText;
    await journal.save();

    res.status(200).json({
      success: true,
      message: "AI reflection generated successfully",
      journal,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Chat with AI using User's Journals as Context
const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Fetch all journals for logged in user
    const journals = await Journal.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    if (journals.length === 0) {
      return res.status(200).json({
        success: true,
        reply:
          "You haven't created any journal entries yet! Once you write a few entries, I can help you reflect on your thoughts, emotions, and progress.",
      });
    }

    // Format journal entries into context string
    const journalContext = journals
      .map(
        (j, index) =>
          `[Entry ${index + 1}] Date: ${new Date(
            j.createdAt
          ).toLocaleDateString()} | Title: ${j.title} | Mood: ${j.mood}\nContent: ${j.content}`
      )
      .join("\n\n---\n\n");

    let aiReply = "";

    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenAI } = require("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemPrompt = `You are Reflection Assistant, a compassionate, insightful AI companion for Reflection Hub. 
Below are all the personal journal entries written by the current user:

=== USER'S JOURNAL ENTRIES ===
${journalContext}
==============================

Instructions:
1. Answer the user's question using ONLY their journal entries above.
2. If asked about mood trends, emotional progress, recurring themes, or specific topics, reference their specific entries and dates accurately.
3. Be warm, empathetic, respectful, and supportive.
4. If the user asks about something not mentioned in their entries, kindly explain that it's not recorded in their journals.
5. Format your response cleanly using markdown (bullet points, bold text).`;

      const promptContents =
        history && Array.isArray(history) && history.length > 0
          ? `${systemPrompt}\n\nChat History:\n${history
              .map(
                (h) =>
                  `${h.sender === "user" ? "User" : "Assistant"}: ${h.text}`
              )
              .join("\n")}\nUser: ${message}`
          : `${systemPrompt}\n\nUser Question: ${message}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptContents,
      });

      aiReply = response.text;
    } else {
      const entryCount = journals.length;
      const latestTitle = journals[0].title;
      aiReply = `Based on your **${entryCount}** journal entries (including your latest entry *"${latestTitle}"*):\n\n- You have been actively reflecting on your thoughts and tracking your emotions.\n- *(To enable full live conversational AI analysis with Google Gemini, please configure \`GEMINI_API_KEY\` in \`server/.env\`)*`;
    }

    res.status(200).json({
      success: true,
      reply: aiReply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
  generateAIReflection,
  chatWithAI,
};