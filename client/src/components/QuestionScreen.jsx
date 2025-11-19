/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { continueQuiz, getQuestion } from '../api/qzicl';


export default function QuestionScreen({ sessionID, onFinished, onExit }) {
    const [q, setQ] = useState(null); // {questionID, questionText, answers[]}
    const [selected, setSelected] = useState(null);
    const [err, setErr] = useState('');

    // Load first question
    useEffect(() => {
        (async () => {
            try {
                const data = await getQuestion(sessionID);
                setQ(data);
            } catch (e) {
                setErr('Failed to load question');
            }
        })();
    }, [sessionID]);

    async function handleNext() {
        if (selected == null) return;
        try {
            const data = await continueQuiz(sessionID, q.questionID, selected);
            if (data.results) {
                onFinished(data.results);
            } else {
                setQ({
                    questionID: data.questionIDnext,
                    questionText: data.questionText,
                    answers: data.answers,
                });
                setSelected(null);
            }
        } catch (e) {
            setErr('Failed to submit answer');
        }
    }

    if (err) return <p>{err}</p>;
    if (!q) return <p>Loading…</p>;

    return (
        <div>
            <h3>Question {q.questionID + 1}</h3>
            <p>{q.questionText}</p>
            <ul>
                {q.answers.map(a => (
                    <li key={a.answerID}>
                        <label>
                            <input
                                type="radio"
                                name="ans"
                                checked={selected === a.answerID}
                                onChange={() => setSelected(a.answerID)}
                            />
                            {' '}{a.answer}
                        </label>
                    </li>
                ))}
            </ul>
            <button disabled={selected == null} onClick={handleNext}>Next</button>
            <button onClick={() => onExit(sessionID)} style={{ marginLeft: 12 }}>Exit</button>
        </div>
    );
}
