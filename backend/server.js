const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const DATA_DIR = path.join(__dirname, 'data');
const TOPICS_FILE = path.join(DATA_DIR, 'topics.json');

// In-memory sessions: { sessionID: { quizID, questions, answers, index, score } }
const sessions = {};

function readJSON(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function findTopicById(id) {
    const topics = readJSON(TOPICS_FILE);
    return topics.find(t => Number(t.id) === Number(id));
}

function findQuizFile(quizID) {
    const topics = readJSON(TOPICS_FILE);
    for (const t of topics) {
        const found = (t.quizzes || []).find(q => q.quizID === quizID);
        if (found) {
            const filePath = path.join(DATA_DIR, t.slug, `${quizID}.json`);
            if (fs.existsSync(filePath)) return filePath;
        }
    }
    return null;
}

function makeQuestionObjects(quizData) {
    // Convert quiz file questions to the shape expected by the client
    // client expects: { questionID, questionText, answers: [{ answerID, answer }] }
    return (quizData.questions || []).map((q, idx) => ({
        questionID: idx,
        questionText: q.question,
        answers: (q.options || []).map((opt, i) => ({ answerID: i, answer: opt })),
        correctAnswer: q.answer
    }));
}

function makeSessionID() {
    return Math.random().toString(36).slice(2, 10);
}

// POST /hello -> return topics
app.post('/hello', (req, res) => {
    try {
        const topics = readJSON(TOPICS_FILE);
        res.json({ topics });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read topics' });
    }
});

// GET /api/topics?topicID= -> return list of quizzes for topic or all topics
app.get('/api/topics', (req, res) => {
    const { topicID } = req.query;
    try {
        const topics = readJSON(TOPICS_FILE);
        if (topicID) {
            const topic = topics.find(t => String(t.id) === String(topicID));
            if (!topic) return res.status(404).json({ error: 'Topic not found' });
            return res.json(topic.quizzes || []);
        }
        res.json(topics);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read topics' });
    }
});

// GET /api/quizes?quizID= -> start quiz, create session
app.get('/api/quizes', (req, res) => {
    const { quizID } = req.query;
    if (!quizID) return res.status(400).json({ error: 'quizID required' });
    const file = findQuizFile(quizID);
    if (!file) return res.status(404).json({ error: 'Quiz not found' });
    try {
        const quizData = readJSON(file);
        const questions = makeQuestionObjects(quizData);
        const sessionID = makeSessionID();
        sessions[sessionID] = {
            quizID,
            questions,
            index: 0,
            score: 0
        };
        res.json({ sessionID, quizIntro: quizData.quizMessage || quizData.quizMessage || quizData.title || '' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load quiz' });
    }
});

// GET /api/go?sessionID= -> return current question
app.get('/api/go', (req, res) => {
    const { sessionID } = req.query;
    const sess = sessions[sessionID];
    if (!sess) return res.status(404).json({ error: 'Session not found' });
    const q = sess.questions[sess.index];
    if (!q) return res.status(404).json({ error: 'No question available' });
    // Remove correctAnswer before sending
    const { correctAnswer, ...out } = q;
    res.json(out);
});

// GET /api/continue?sessionID=&questionID=&answerID=
app.get('/api/continue', (req, res) => {
    const { sessionID, questionID, answerID } = req.query;
    const sess = sessions[sessionID];
    if (!sess) return res.status(404).json({ error: 'Session not found' });
    const idx = Number(questionID);
    const ansId = Number(answerID);
    const current = sess.questions[idx];
    if (!current) return res.status(400).json({ error: 'Invalid question' });
    const selected = current.answers[ansId];
    if (selected && selected.answer === current.correctAnswer) {
        sess.score += 1;
    }
    sess.index = idx + 1;
    if (sess.index >= sess.questions.length) {
        const results = `You scored ${sess.score}/${sess.questions.length}`;
        // Optionally destroy session
        delete sessions[sessionID];
        return res.json({ results });
    }
    const next = sess.questions[sess.index];
    const { correctAnswer, ...out } = next;
    res.json(out);
});

// POST /api/exit -> accept { sessionID }
app.post('/api/exit', (req, res) => {
    const { sessionID } = req.body;
    if (sessionID && sessions[sessionID]) delete sessions[sessionID];
    res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`QZICL backend server listening on http://localhost:${PORT}`);
});
