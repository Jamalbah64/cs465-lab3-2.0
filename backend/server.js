const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
// Parse JSON bodies
app.use(express.json());

// Directory where quiz data resides. This expects a `data` folder alongside this server.js
const DATA_DIR = path.join(__dirname, 'data');
const TOPICS_FILE = path.join(DATA_DIR, 'topics.json');

// In-memory session store.  Keys are session IDs; values track quiz state.
const sessions = {};

/**
 * Read and parse a JSON file.  Throws on error.
 * @param {string} filePath
 */
function readJSON(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Locate the quiz JSON file given a quizID by searching topics.
 * Returns the full path if found, otherwise null.
 * @param {string|number} quizID
 */
function findQuizFile(quizID) {
    const topics = readJSON(TOPICS_FILE);
    for (const t of topics) {
        const match = (t.quizzes || []).find(q => String(q.quizID) === String(quizID));
        if (match) {
            const file = path.join(DATA_DIR, t.slug, `${quizID}.json`);
            if (fs.existsSync(file)) return file;
        }
    }
    return null;
}

/**
 * Convert quiz questions into objects expected by the client.
 * Each question record includes its correct answer, which is omitted when sent.
 * @param {object} quizData
 */
function makeQuestionObjects(quizData) {
    return (quizData.questions || []).map((q, idx) => ({
        questionID: idx,
        questionText: q.question,
        answers: (q.options || []).map((opt, i) => ({ answerID: i, answer: opt })),
        correctAnswer: q.answer
    }));
}

/**
 * Generate a pseudo-random session ID.
 */
function makeSessionID() {
    return Math.random().toString(36).slice(2, 12);
}

/* Returns a greeting and a map of topic IDs to their titles.*/
app.post('/hello', (req, res) => {
    try {
        const topics = readJSON(TOPICS_FILE);
        const topicMap = {};
        topics.forEach((t) => {
            // Use id as key and the topic name or title as value
            const key = String(t.id);
            const val = t.name || t.title || t.topic || '';
            topicMap[key] = val;
        });
        // You can customize the title if desired
        res.json({ title: 'Qzicl Quiz Server', ...topicMap });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read topics' });
    }
});

/*When topicID is supplied, returns the list of quizzes for that topic.*/
app.get('/api/topics', (req, res) => {
    const { topicID } = req.query;
    if (!topicID) {
        // topicID is required according to the Lab4 spec
        return res.status(400).json({ error: 'badtopicID', topicID: '' });
    }
    try {
        const topics = readJSON(TOPICS_FILE);
        const topic = topics.find((t) => String(t.id) === String(topicID));
        if (!topic) {
            return res.status(404).json({ error: 'badtopicID', topicID });
        }
        // Return only quizID and title fields per spec
        const quizzes = (topic.quizzes || []).map((q) => ({
            quizID: q.quizID,
            title: q.title || q.quizTitle || ''
        }));
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read topics' });
    }
});

/*
*Starts a new session and returns { sessionID, quizIntro }
*/
app.get('/api/quizes', (req, res) => {
    const { quizID } = req.query;
    if (!quizID) {
        return res.status(400).json({ error: 'badquizID', quizID: '' });
    }
    const file = findQuizFile(quizID);
    if (!file) {
        return res.status(404).json({ error: 'badquizID', quizID });
    }
    try {
        const quizData = readJSON(file);
        const questions = makeQuestionObjects(quizData);
        const sessionID = makeSessionID();
        sessions[sessionID] = {
            quizID,
            questions,
            index: 0,
            score: 0,
        };
        const intro = quizData.quizMessage || quizData.quizIntro || quizData.title || '';
        res.json({ sessionID, quizIntro: intro });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load quiz' });
    }
});

/*
Returns the current question for the session.
*/
app.get('/api/go', (req, res) => {
    const { sessionID } = req.query;
    const sess = sessions[sessionID];
    if (!sess) {
        return res.status(404).json({ error: 'badsessionID', sessionID });
    }
    const q = sess.questions[sess.index];
    if (!q) {
        return res.status(404).json({ error: 'No question available' });
    }
    const { correctAnswer, ...out } = q;
    res.json(out);
});

/*
Accepts an answer and returns either the next question or final results.
*/
app.get('/api/continue', (req, res) => {
    const { sessionID, questionID, answerID } = req.query;
    const sess = sessions[sessionID];
    if (!sess) {
        return res.status(404).json({ error: 'badsessionID', sessionID });
    }
    const idx = Number(questionID);
    const ansIdx = Number(answerID);
    const current = sess.questions[idx];
    if (!current) {
        return res.status(404).json({ error: 'badquestionID', questionID });
    }
    const selected = current.answers[ansIdx];
    if (selected && selected.answer === current.correctAnswer) {
        sess.score += 1;
    }
    sess.index = idx + 1;
    if (sess.index >= sess.questions.length) {
        const results = `You scored ${sess.score}/${sess.questions.length}`;
        delete sessions[sessionID];
        return res.json({ results });
    }
    const next = sess.questions[sess.index];
    const { correctAnswer, ...out } = next;
    // rename questionID to questionIDnext to satisfy spec
    res.json({
        questionIDnext: out.questionID,
        questionText: out.questionText,
        answers: out.answers,
    });
});

/*
Terminates the session and returns { exited: true }
*/
app.post('/api/exit', (req, res) => {
    const { sessionID } = req.body;
    if (sessionID && sessions[sessionID]) {
        delete sessions[sessionID];
    }
    res.json({ exited: true });
});

/**
 * Default catch-all route.  Any route not matched above returns a 400 error.
 */
app.use((req, res) => {
    res.status(400).json({ error: 'bad route' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Qzicl backend server listening on http://localhost:${PORT}`);
});
