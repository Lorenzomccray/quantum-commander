import axios from 'axios';
import getPort from 'get-port';

const detectPort = async () => {
  const envPort = import.meta.env.VITE_ASSISTANT_PORT;
  if (envPort) return envPort;
  try {
    const res = await fetch('/.port');
    if (res.ok) {
      const text = (await res.text()).trim();
      if (text) return text;
    }
  } catch (_) {}
  return await getPort();
};

let portPromise;
export const getAssistantPort = async () => {
  if (!portPromise) {
    portPromise = detectPort().then(p => {
      console.log('Assistant port:', p);
      return p;
    });
  }
  return portPromise;
};

export const sendMessage = async (message) => {
  const port = await getAssistantPort();
  const url = `http://localhost:${port}/chat`;
  const res = await axios.post(url, { message });
  return res.data;
};
