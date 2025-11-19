// client/src/components/ScoreScreen.jsx

export default function ScoreScreen({ results, onDone }) {
    // For when results is a string (old format), to just print it
    if (typeof results === 'string') {
        return (
            <div>
                <h2>Results</h2>
                <p>{results}</p>
                <button onClick={onDone}>Return to Topics</button>
            </div>
        );
    }

    // If my results is an object with details (new format)
    const { score, total, correct, wrong } = results || {};

    return (
        <div>
            <h2>Results</h2>
            <p>You scored {score} out of {total}</p>
            <p>Correct answers: {correct}</p>
            <p>Wrong answers: {wrong}</p>
            <button onClick={onDone}>Return to Topics</button>
        </div>
    );
}
