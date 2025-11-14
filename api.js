// API routes for quiz functionality
// client/api.js
import axios from 'axios';
const baseURL = 'http://localhost:3000';

// Get topics list
export async function getTopics() {
    const res = await axios.post(`${baseURL}/hello`, { who: 'qzicl', action: 'hello' });
    // The response is like { title: ..., '1': 'EU', '2': 'Science', ... }
    // Convert into an array of { id, name }
    return Object.entries(res.data)
        .filter(([key]) => !isNaN(key))
        .map(([id, name]) => ({ id: parseInt(id), name }));
}

// Get quizzes for a topic
export async function getQuizzes(topicID) {
    const res = await axios.get(`${baseURL}/api/topics`, { params: { topicID } });
    return res.data; // array of { quizID, title }
}

// Start a new quiz session
export async function startQuiz(quizID) {
    const res = await axios.get(`${baseURL}/api/quizes`, { params: { quizID } });
    return res.data; // { sessionID, quizIntro }
}

// Get first question
export async function getQuestion(sessionID) {
    const res = await axios.get(`${baseURL}/api/go`, { params: { sessionID } });
    return res.data;
}

// Submit an answer and get next question or results
export async function submitAnswer(sessionID, questionID, answerID) {
    const res = await axios.get(`${baseURL}/api/continue`, {
        params: { sessionID, questionID, answerID }
    });
    return res.data;
}

// Exit a quiz early
export async function exitQuiz(sessionID) {
    const res = await axios.post(`${baseURL}/api/exit`, { sessionID });
    return res.data;
}

