const pingButton = document.getElementById('ping');
const responseEl = document.getElementById('response');

const backendUrl = import.meta.env?.VITE_API_URL || 'http://localhost:4000/health';

pingButton.addEventListener('click', async () => {
  responseEl.textContent = 'Requesting...';
  try {
    const res = await fetch(backendUrl);
    const data = await res.json();
    responseEl.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    responseEl.textContent = `Error: ${error.message}`;
  }
});
