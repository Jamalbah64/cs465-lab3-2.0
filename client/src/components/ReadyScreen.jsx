/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { startQuiz } from '../api/qzicl';

export default function ReadyScreen({ quizID, onStart, onExit }) {
    const [intro, setIntro] = useState('');
    const [sessionID, setSessionID] = useState(null);
    const [err, setErr] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await startQuiz(quizID);
                setSessionID(res.sessionID);
                setIntro(res.quizIntro);
            } catch (e) {
                setErr('Failed to start quiz');
            }
        })();
    }, [quizID]);

    if (err) return <p>{err}</p>;
    if (!sessionID) return <p>Preparing quiz…</p>;

    return (
        <div>
            <p>{intro}</p>
            <button onClick={() => onStart(sessionID)}>Go!</button>
            <button onClick={onExit} style={{ marginLeft: 12 }}>Exit</button>
        </div>
    );
}
