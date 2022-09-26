import { useState, useEffect } from 'react';

export function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8080`);
    ws.addEventListener('open', () => { setWs(ws); });
  }, []);

  if (ws === null) {
    return null;
  }

  return (
    <>
      <input
        type='text'
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
        }}
      />
      <button
        onClick={() => {
          ws.send(message);
        }}
      >
        Send
      </button>
    </>
  );
}
