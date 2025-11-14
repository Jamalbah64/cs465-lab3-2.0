export default function ScoreScreen({ results, onDone }) {
    return (
        <div>
            <h2>Results</h2>
            <p>{results}</p>
            <button onClick={onDone}>Return to Topics</button>
        </div>
    );
}
