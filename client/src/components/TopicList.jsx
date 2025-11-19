/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { hello } from '../api/qzicl';

export default function TopicList({ onSelectTopic }) {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await hello();
                const topicArray = Object.entries(res.topics).map(([id, name]) => ({
                    id: Number(id),
                    name,
                }));
                setTopics(topicArray);
            } catch (e) {
                setErr('Failed to load topics');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <p>Loading topics…</p>;
    if (err) return <p>{err}</p>;

    return (
        <div>
            <h1>Topics</h1>
            <ul>
                {topics.map(t => (
                    <li key={t.id}>
                        <button onClick={() => onSelectTopic(t.id, t.name)}>{t.name}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
