/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { getQuizzes } from '../api/qzicl';

export default function QuizList({ topicID, topicName, onSelectQuiz, onBack }) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const data = await getQuizzes(topicID);
                setQuizzes(data.quizzes);
            } catch (e) {
                setErr('Failed to load quizzes');
            } finally {
                setLoading(false);
            }
        })();
    }, [topicID]);

    if (loading) return <p>Loading quizzes…</p>;
    if (err) return <p>{err}</p>;

    return (
        <div>
            <h2>{topicName} — Quizzes</h2>
            <button onClick={onBack}>Back</button>
            <ul>
                {quizzes.map(q => (
                    <li key={q.quizID}>
                        <button onClick={() => onSelectQuiz(q.quizID)}>{q.title}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
