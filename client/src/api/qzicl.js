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

export const hello = () => http.post('/hello', { who: 'qzicl', action: 'hello' });
export const getQuizzes = (topicID) => http.get('/api/topics', { params: { topicID } });
export const startQuiz = (quizID) => http.get('/api/quizes', { params: { quizID } });
export const getQuestion = (sessionID) => http.get('/api/go', { params: { sessionID } });
export const continueQuiz = (sessionID, questionID, answerID) =>
    http.get('/api/continue', { params: { sessionID, questionID, answerID } });
export const exitQuiz = (sessionID) => http.post('/api/exit', { sessionID });
