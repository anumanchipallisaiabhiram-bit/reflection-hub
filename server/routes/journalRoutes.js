const express = require("express");
const router = express.Router();

const {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
  generateAIReflection,
  chatWithAI,
} = require("../controllers/journalController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createJournal);
router.get("/", authMiddleware, getJournals);
router.post("/ai-chat", authMiddleware, chatWithAI);
router.get("/:id", authMiddleware, getJournalById);
router.put("/:id", authMiddleware, updateJournal);
router.delete("/:id", authMiddleware, deleteJournal);
router.post("/:id/ai-reflection", authMiddleware, generateAIReflection);

module.exports = router;