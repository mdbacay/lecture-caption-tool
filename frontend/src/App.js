import './App.css';
import { useState } from 'react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [captions, setCaptions] = useState("");
  const [summary, setSummary] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const handleRecordToggle = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      
      if (mediaRecorder) {
        mediaRecorder.stop();
      }

    } else {
      // Start recording
      setIsRecording(true);
      setCaptions("");
      setSummary("");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        const audioChunks = [];

        // Collect all audio chunks
        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        // When recording stops, send all audio to backend
        recorder.onstop = async () => {
          console.log('Recording stopped, processing audio...');
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];
            
            setCaptions("Processing transcription...");
            
            try {
              const response = await fetch('http://localhost:3001/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Audio })
              });
              
              const data = await response.json();
              console.log('Backend response:', data);
              
              if (data.text) {
                setCaptions(data.text);
                
                // Now get summary
                const summaryResponse = await fetch('http://localhost:3001/api/summary', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ transcript: data.text })
                });
                const summaryData = await summaryResponse.json();
                setSummary(summaryData.summary);
              } else {
                setCaptions("No speech detected. Please try again.");
              }
            } catch (error) {
              console.error('Error:', error);
              setCaptions("Error processing audio. Please try again.");
            }
          };
        };

        recorder.start();
        setCaptions("Recording... Speak now!");

      } catch (error) {
        console.error('Microphone error:', error);
        alert('Could not access microphone.');
        setIsRecording(false);
      }
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