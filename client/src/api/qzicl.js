//This file centralizes Axios calls to the QZICL API
import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' }
});

// Normalize responses: callers receive the payload directly (`res.data`)
http.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
);

/**
 * POST /hello
 * Returns an object with a title and a map of topics.  The server
 * response is a flat object where the topic IDs are top‑level keys
 * alongside the title.  This helper reshapes the data into
 * `{ title, topics: { id: name, ... } }` so your components can
 * destructure it cleanly.
 */
export async function hello() {
    const data = await http.post('/hello', { who: 'qzicl', action: 'hello' });
    // Extract the title and gather the remaining properties as the topics map
    const { title, ...rest } = data;
    return { title, topics: rest };
}

/**
 * GET /api/topics
 * Accepts a topicID and returns an array of quizzes.  To mirror the
 * destructuring pattern used in the React components, this helper
 * returns an object with a `quizzes` property.
 *
 * Example return value:
 *   { quizzes: [ { quizID: 'eu-capitals', title: 'EU Capitals Quiz' }, … ] }
 */
export async function getQuizzes(topicID) {
    const list = await http.get('/api/topics', { params: { topicID } });
    return { quizzes: list };
}

/**
 * GET /api/quizes
 * Starts a new quiz session.  The server returns `{ sessionID, quizIntro }`.
 * This helper simply forwards that object along.
 */
export async function startQuiz(quizID) {
    return await http.get('/api/quizes', { params: { quizID } });
}

/**
 * GET /api/go
 * Retrieves the current question for a session.  The server returns
 * `{ questionID, questionText, answers }`.  This helper forwards it as is.
 */
export async function getQuestion(sessionID) {
    return await http.get('/api/go', { params: { sessionID } });
}

/**
 * GET /api/continue
 * Submits an answer and returns either the next question
 * or final results.  The returned object will have one of two forms:
 *   { questionIDnext, questionText, answers } – if there are more
 *     questions to follow, or
 *   { results } – when the quiz is finished.
 */
export async function continueQuiz(sessionID, questionID, answerID) {
    return await http.get('/api/continue', {
        params: { sessionID, questionID, answerID },
    });
}

/**
 * POST /api/exit
 * Exits a quiz session early and returns `{ exited: true }`.
 */
export async function exitQuiz(sessionID) {
    return await http.post('/api/exit', { sessionID });
}
