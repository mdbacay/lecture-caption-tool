import './App.css';
import { useState } from 'react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [captions, setCaptions] = useState("");
  const [summary, setSummary] = useState("");

  const handleRecordToggle = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);

      // Send the transcript to the backend and get a summary back
      fetch('http://localhost:3001/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: captions })
      })
        .then(response => response.json())
        .then(data => setSummary(data.summary))
        .catch(error => console.error('Error:', error));

    } else {
      // Start recording
      setIsRecording(true);
      setCaptions("");
      setSummary("");

      // Simulate captions appearing over time
      const demoText = "Welcome to the lecture caption tool. This is a demonstration of how captions will appear in real time as the speaker talks. Each word appears automatically creating a smooth captioning experience for students.";
      const words = demoText.split(" ");
      let currentText = "";

      words.forEach((word, index) => {
        setTimeout(() => {
          currentText += word + " ";
          setCaptions(currentText);
        }, index * 500);
      });
    }
  };

  return (
    <div className="App">
      <h1>Lecture Caption Tool</h1>

      <button onClick={handleRecordToggle}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {isRecording && (
        <div className="captions-container">
          <h2>Live Captions</h2>
          <div className="captions">
            {captions || "Captions will appear here as you speak..."}
          </div>
        </div>
      )}

      {summary && (
        <div className="summary-container">
          <h2>Summary</h2>
          <div className="summary">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;