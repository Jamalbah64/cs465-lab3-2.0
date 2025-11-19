// client/src/App.jsx

import { useState } from 'react';
import { exitQuiz } from './api/qzicl';

import QuestionScreen from './components/QuestionScreen';
import QuizList from './components/QuizList';
import ReadyScreen from './components/ReadyScreen';
import ScoreScreen from './components/ScoreScreen';
import TopicList from './components/TopicList';
import './index.css';

export default function App() {
  const [stage, setStage] = useState('topics'); // "topics" | "quizzes" | "ready" | "question" | "score"

  // Current topic info
  const [topic, setTopic] = useState({ id: null, name: '' });

  // Current quiz info (ID only; title is inside the quiz data)
  const [quizID, setQuizID] = useState('');

  // Active session ID from the server
  const [sessionID, setSessionID] = useState(null);

  // Final results object from the server at the end of a quiz
  const [results, setResults] = useState('');

  // Reset everything back to the starting state
  const resetAll = () => {
    setStage('topics');
    setTopic({ id: null, name: '' });
    setQuizID('');
    setSessionID(null);
    setResults('');
  };

  const renderMainPanel = () => {
    if (stage === 'topics') {
      return (
        <>
          <h2 className="section-title">Choose a Topic</h2>
          <p className="section-subtitle">
            Pick a topic to see all available quizzes.
          </p>

          <TopicList
            onSelectTopic={(id, name) => {
              setTopic({ id, name });
              setStage('quizzes');
            }}
          />
        </>
      );
    }

    if (stage === 'quizzes') {
      return (
        <>
          <h2 className="section-title">Choose a Quiz</h2>
          <p className="section-subtitle">
            Topic: <strong>{topic.name || 'None selected'}</strong>
          </p>

          <QuizList
            topicID={topic.id}
            topicName={topic.name}
            onSelectQuiz={(qid) => {
              setQuizID(qid);
              setStage('ready');
            }}
            onBack={() => setStage('topics')}
          />
        </>
      );
    }

    if (stage === 'ready') {
      return (
        <>
          <h2 className="section-title">Ready to begin?</h2>
          <p className="section-subtitle">
            When you start, the timer (and your brain) will get to work.
          </p>

          <ReadyScreen
            quizID={quizID}
            onStart={(sid) => {
              setSessionID(sid);
              setStage('question');
            }}
            onExit={() => setStage('topics')}
          />
        </>
      );
    }

    if (stage === 'question') {
      return (
        <>
          <h2 className="section-title">Question</h2>
          <p className="section-subtitle">
            Choose the best answer, then move on to the next one.
          </p>

          <QuestionScreen
            sessionID={sessionID}
            onFinished={(res) => {
              setResults(res);
              setStage('score');
            }}
            onExit={async (sid) => {
              // Let the server know we are bailing out of this quiz
              await exitQuiz(sid);
              resetAll();
            }}
          />
        </>
      );
    }

    if (stage === 'score') {
      return (
        <>
          <h2 className="section-title">Results</h2>
          <p className="section-subtitle">
            Here&apos;s how you did on this quiz.
          </p>

          <ScoreScreen
            results={results}
            onDone={resetAll}
          />
        </>
      );
    }

    // Simple safety fallback if the stage ever gets out of sync
    return (
      <>
        <h2 className="section-title">Something went wrong</h2>
        <p className="section-subtitle">
          The app got confused. Let&apos;s jump back to the start.
        </p>
        <button className="btn btn-primary" onClick={resetAll}>
          Back to topics
        </button>
      </>
    );
  };

  return (
    <div className="app-shell">
      {/* Top bar: title + connection status */}
      <header className="app-header">
        <div className="app-title-block">
          <div className="app-title">
            Qzicl
            <span className="badge">Quiz Lab</span>
          </div>
          <p className="app-subtitle">
            Pick a topic, choose a quiz, and see how much you remember.
          </p>
        </div>

        <div className="app-header-meta">
          <div className="status-pill">
            <span className="dot" />
            <span>Server: Live</span>
          </div>
        </div>
      </header>

      {/* Main region: left panel is content, right panel is a sidebar */}
      <div className="app-body">
        {/* Main quiz flow (topics → quizzes → questions → score) */}
        <main className="page-panel">
          {renderMainPanel()}
        </main>

        {/* Sidebar: quick status + small summary */}
        <aside className="sidebar-panel">
          <h3 className="section-title">Current Status</h3>
          <p className="muted">
            Stage: <strong>{stage}</strong>
          </p>

          <div style={{ marginTop: '0.75rem' }}>
            <p className="section-subtitle">Selected topic</p>
            <div className="badge-soft">
              {topic.name || 'None yet'}
            </div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <p className="section-subtitle">Selected quiz</p>
            <div className="badge-soft">
              {quizID || 'None yet'}
            </div>
          </div>

          {results && (
            <div className="score-card" style={{ marginTop: '1rem' }}>
              <div className="score-main">
                {/* These property names depend on how the backend shapes results */}
                Score: {results.score} / {results.total}
              </div>
              <div className="score-meta">
                Correct: {results.correct} · Wrong: {results.wrong}
              </div>
            </div>
          )}

          <div className="spacer" />

          <div className="button-row">
            <button className="btn btn-ghost" onClick={resetAll}>
              Start over
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
