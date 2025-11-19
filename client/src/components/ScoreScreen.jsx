// client/src/components/ScoreScreen.jsx

export default function ScoreScreen({ results, onDone }) {
    if (typeof results === 'string') {
        return (
            <div>
                <h2>Results</h2>
                <p>{results}</p>
                <button onClick={onDone}>Return to Topics</button>
            </div>
        );
    }
}
