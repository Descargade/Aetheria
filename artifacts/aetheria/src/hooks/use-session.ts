import { useState, useEffect } from 'react';

export function useSession() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('aetheria_session_id');
    if (stored) {
      setSessionId(stored);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem('aetheria_session_id', newId);
      setSessionId(newId);
    }
  }, []);

  return { sessionId };
}