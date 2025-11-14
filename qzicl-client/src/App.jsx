import { useState } from 'react';
import { exitQuiz } from './api/qzicl';
import QuestionScreen from './components/QuestionScreen';
import QuizList from './components/QuizList';
import ReadyScreen from './components/ReadyScreen';
import ScoreScreen from './components/ScoreScreen';
import TopicList from './components/TopicList';

export default function App() {
  const [stage, setStage] = useState('topics');
  const [topic, setTopic] = useState({ id: null, name: '' });
  const [quizID, setQuizID] = useState('');
  const [sessionID, setSessionID] = useState(null);
  const [results, setResults] = useState('');

  return (
    <>
      {stage === 'topics' && (
        <TopicList
          onSelectTopic={(id, name) => { setTopic({ id, name }); setStage('quizzes'); }}
        />
      )}

      {stage === 'quizzes' && (
        <QuizList
          topicID={topic.id}
          topicName={topic.name}
          onSelectQuiz={(qid) => { setQuizID(qid); setStage('ready'); }}
          onBack={() => setStage('topics')}
        />
      )}

      {stage === 'ready' && (
        <ReadyScreen
          quizID={quizID}
          onStart={(sid) => { setSessionID(sid); setStage('question'); }}
          onExit={() => setStage('topics')}
        />
      )}

      {stage === 'question' && (
        <QuestionScreen
          sessionID={sessionID}
          onFinished={(res) => { setResults(res); setStage('score'); }}
          onExit={async (sid) => { await exitQuiz(sid); setStage('topics'); }}
        />
      )}

      {stage === 'score' && (
        <ScoreScreen
          results={results}
          onDone={() => setStage('topics')}
        />
      )}
    </>
  );
}
