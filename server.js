/*This os the server file that will load quiz data
from json files in the data directory and serve it via an API.
*/

import cors from 'cors'; // CORS middleware to handle cross-origin requests
import express from 'express'; // Express framework for building the server
import fs from 'fs'; // File system module to read files  
import log from 'npmlog'; // logging module for better logging
import path from 'path'; // Path module to handle file paths

const app = express(); // Create an Express application
const PORT = process.env.PORT || 3000; // Define the port to run the server on
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON request bodies


const topics = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'topics.json')));
// Load topics from topics.json file
log.info('Server', `Loaded ${topics.length} topics.`); // Log the number of topics loaded

const quizzes = {}; // Object to hold quizzes for each topic

for (const topic of topics) {
    topics.quizzes.forEach(({ quizID }) => {
        const slug = topic.slug; // Get the slug for the topic
        const file = path.join(__dirname, 'data', slug, `${quizID}.json`); // Construct the file path for the quiz
        quizzes[quizID] = JSON.parse(fs.readFileSync(file)); // Load the quiz data and store it in the quizzes object
        log.info('Server', `Loaded quiz ${quizID} for topic ${slug}.`); // Log the loading of the quiz
    });
}

//Session storage for user progress

let nextSessionID = 1; // Initialize session ID counter
const sessions = {}; // Object to hold session data

//POST endpoint to start a new quiz session
app.post('/hello', (req, res) => {

    const topicMap = {}; // Map to hold topic slugs to topic data
    topics.forEach(t => { topicMap[t.id] = t.name }); // Populate the topic map
    log.info('server', 'POST /hello'); // Log the request
    res.json({ message: 'Hello, welcome to the Quiz API!', topics: topicMap }); // Respond with a welcome message and list of topics

});

//GET endpoint to fetch a quiz by its ID
app.get('/api/topics', (req, res) => { // Endpoint to get quizzes for a specific topic
    const topicID = parseInt(req.query.topicID, 10); // Get the topicID from query parameters
    const topic = topics.find(t => t.id === topicID);   // Find the topic with the given ID
    if (!topic) { // If topic not found, respond with an error
        res.status(404).json({ error: 'badtopicID', topicID });
        return;
    }
    log.info('server', `GET /api/topics?topicID=${topicID}`); // Log the request
    res.json(topic.quizzes); // Respond with the quizzes for the topic
});

//GET endpoint to fetch a quiz by its ID
app.get('/api/quizes', (req, res) => { // Endpoint to get a quiz by its ID
    const { quizID } = req.query;
    const quiz = quizzes[quizID];
    if (!quiz) { // If quiz not found, respond with an error
        res.status(404).json({ error: 'badquizID', quizID });
        return;
    }
    const sessionID = nextSessionID++; // Generate a new session ID
    sessions[sessionID] = { quizID, index: 0, score: 0 }; // Initialize session data
    log.info('server', `Start session ${sessionID} for quiz ${quizID}`);
    // quizMessage becomes the “intro”
    res.json({ // Respond with quiz intro and session ID
        sessionID,
        quizIntro: quiz.quizMessage || `Starting quiz: ${quiz.title}`
    });
});

//GET endpoint to fetch the next question in a quiz session
app.get('/api/go', (req, res) => { // Endpoint to get the next question for a session
    const sessionID = parseInt(req.query.sessionID, 10);
    const session = sessions[sessionID];
    if (!session) { // If session not found, respond with an error
        res.status(404).json({ error: 'badsessionID', sessionID });
        return;
    }
    const quiz = quizzes[session.quizID]; // Get the quiz for the session
    const { index } = session; // Get the current question index
    const question = quiz.questions[index]; // Get the current question
    // Build answer objects with answerIDs = 0..n-1
    const answers = question.options.map((text, idx) => ({ // Map options to answer objects
        answerID: idx,
        answer: text
    }));
    log.info('server', `Serve question ${index} for session ${sessionID}`);
    res.json({ // Respond with the question and possible answers
        questionID: index,
        questionText: question.question,
        answers
    });
});

//GET endpoint to submit an answer for a quiz question
app.get('/api/go', (req, res) => { // Endpoint to get the next question for a session
    const sessionID = parseInt(req.query.sessionID, 10); // Get sessionID from query parameters
    const session = sessions[sessionID]; // Get the session data
    if (!session) { // If session not found, respond with an error
        res.status(404).json({ error: 'badsessionID', sessionID });
        return;
    }
    const quiz = quizzes[session.quizID]; // Get the quiz for the session
    const { index } = session; // Get the current question index
    const question = quiz.questions[index]; // Get the current question
    // Build answer objects with answerIDs
    const answers = question.options.map((text, idx) => ({ // Map options to answer objects
        answerID: idx,
        answer: text
    }));
    log.info('server', `Serve question ${index} for session ${sessionID}`); // Log the request
    res.json({ // Respond with the question and possible answers
        questionID: index,
        questionText: question.question,
        answers
    });
});

//GET endpoint to submit an answer for a quiz question
app.get('/api/continue', (req, res) => { // Endpoint to submit an answer and get the next question
    const sessionID = parseInt(req.query.sessionID, 10); // Get sessionID from query parameters
    const questionID = parseInt(req.query.questionID, 10); // Get questionID from query parameters
    const answerID = parseInt(req.query.answerID, 10); // Get answerID from query parameters
    const session = sessions[sessionID]; // Get the session data
    if (!session) { // If session not found, respond with an error
        res.status(404).json({ error: 'badsessionID', sessionID });
        return;
    }
    const quiz = quizzes[session.quizID]; // Get the quiz for the session
    const question = quiz.questions[questionID]; // Get the question being answered
    if (!question) { // If question not found, respond with an error
        res.status(404).json({ error: 'badquestionID', questionID });
        return;
    }
    // Check answer
    const selected = question.options[answerID];
    if (selected === question.answer) {
        session.score++;
    }
    session.index++;
    log.info('server', `Answer received for session ${sessionID}: "${selected}"`);
    // Checks if there are more questions
    if (session.index < quiz.questions.length) {
        const nextQ = quiz.questions[session.index];
        const answers = nextQ.options.map((text, idx) => ({
            answerID: idx,
            answer: text
        }));
        res.json({ // Respond with the next question and possible answers
            questionIDnext: session.index,
            questionText: nextQ.question,
            answers
        });
    } else {
        // Finished—return final results
        const score = session.score;
        delete sessions[sessionID];
        res.json({ results: `You scored ${score} out of ${quiz.questions.length}!` });
    }
});

//POST endpoint to end the current quiz session
app.post('/api/exit', (req, res) => { // Endpoint to exit a quiz session
    const { sessionID } = req.body;
    delete sessions[sessionID]; // Remove the session data
    log.info('server', `Session ${sessionID} exited`); // Log the exit
    res.json({ exited: true }); // Respond with confirmation
});

//Catch all for undefined routes
app.use((req, res) => {
    res.status(400).json({ error: 'bad route' });
});

app.listen(PORT, () => {
    log.info('Server', `Server is running on port ${PORT}`);
}); // Start the server and listen on the defined port
