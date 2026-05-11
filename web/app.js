const chat = document.getElementById('chat');
const form = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt');
const sendButton = document.getElementById('send-button');
const micButton = document.getElementById('mic-button');
const imageUpload = document.getElementById('image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image');

const sobuPngUrlInput = document.getElementById('sobu-png-url');
const sobuPreview = document.getElementById('sobu-preview');
const inputUrl = document.getElementById('input-url');
const youtubeUrl = document.getElementById('youtube-url');
const youtubeKey = document.getElementById('youtube-key');
const twitchUrl = document.getElementById('twitch-url');
const twitchKey = document.getElementById('twitch-key');
const tiktokUrl = document.getElementById('tiktok-url');
const tiktokKey = document.getElementById('tiktok-key');
const enableYoutube = document.getElementById('enable-youtube');
const enableTwitch = document.getElementById('enable-twitch');
const enableTiktok = document.getElementById('enable-tiktok');
const platformChecklist = document.getElementById('platform-checklist');
const startMultistreamBtn = document.getElementById('start-multistream');
const stopMultistreamBtn = document.getElementById('stop-multistream');
const multistreamStatus = document.getElementById('multistream-status');

let currentImageBase64 = null;
let mediaRecorder = null;
let isRecording = false;
let isTranscribing = false;
let audioChunks = [];

function getPlatformConfig() {
  return [
    { name: 'YouTube', enabledInput: enableYoutube, urlInput: youtubeUrl, keyInput: youtubeKey },
    { name: 'Twitch', enabledInput: enableTwitch, urlInput: twitchUrl, keyInput: twitchKey },
    { name: 'TikTok', enabledInput: enableTiktok, urlInput: tiktokUrl, keyInput: tiktokKey },
  ];
}

function refreshPlatformChecklist() {
  const items = getPlatformConfig().map(({ name, enabledInput, urlInput, keyInput }) => {
    const enabled = !!enabledInput?.checked;
    const ready = enabled && !!urlInput.value.trim() && !!keyInput.value.trim();
    const stateLabel = enabled ? (ready ? 'Ready' : 'Missing URL or Key') : 'Off';
    const stateClass = enabled ? (ready ? 'ready' : 'missing') : '';
    return `<li><strong>${name}:</strong> <span class="${stateClass}">${stateLabel}</span></li>`;
  }).join('');

  platformChecklist.innerHTML = items;
}

function updatePlatformInputsState() {
  getPlatformConfig().forEach(({ enabledInput, urlInput, keyInput }) => {
    const enabled = !!enabledInput?.checked;
    urlInput.disabled = !enabled;
    keyInput.disabled = !enabled;
  });
  refreshPlatformChecklist();
}

function setControlsDisabled(disabled) {
  sendButton.disabled = disabled;
  if (micButton) micButton.disabled = disabled;
}

function setMicState(recording) {
  isRecording = recording;
  if (!micButton) return;
  micButton.classList.toggle('recording', recording);
  micButton.title = recording ? 'Stop recording' : 'Start microphone input';
  micButton.setAttribute('aria-pressed', recording ? 'true' : 'false');
}

function addMessage(role, text, imageUrl = null) {
  const container = document.createElement('div');
  container.className = `message-container ${role}`;

  const avatar = document.createElement('div');
  avatar.className = `avatar ${role}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper';

  const nameLabel = document.createElement('div');
  nameLabel.className = 'sender-name';
  nameLabel.textContent = role === 'eve' ? 'エーヴェ様' : 'そぶくん';

  const bubble = document.createElement('article');
  bubble.className = `message ${role}`;

  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    img.style.marginBottom = '8px';
    bubble.appendChild(img);
  }

  const textNode = document.createElement('span');
  textNode.textContent = text;
  bubble.appendChild(textNode);

  wrapper.appendChild(nameLabel);
  wrapper.appendChild(bubble);
  container.appendChild(avatar);
  container.appendChild(wrapper);

  chat.appendChild(container);
  chat.scrollTop = chat.scrollHeight;
}

async function transcribeAudioBlob(audioBlob) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read recorded audio.'));
    reader.readAsDataURL(audioBlob);
  });

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64: dataUrl, mimeType: audioBlob.type || 'audio/webm' }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? 'Failed to transcribe audio.');
  return typeof payload.text === 'string' ? payload.text.trim() : '';
}

async function toggleRecording() {
  if (isTranscribing) return;
  if (isRecording && mediaRecorder) {
    mediaRecorder.stop();
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    addMessage('eve', 'Microphone input is not supported in this browser.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener('stop', async () => {
      setMicState(false);
      stream.getTracks().forEach((track) => track.stop());
      if (audioChunks.length === 0) return;

      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      try {
        isTranscribing = true;
        setControlsDisabled(true);
        const transcript = await transcribeAudioBlob(audioBlob);
        if (!transcript) {
          addMessage('eve', 'I listened carefully, but I could not hear any clear words.');
          return;
        }

        const existingText = promptInput.value.trim();
        promptInput.value = existingText ? `${existingText} ${transcript}` : transcript;
        promptInput.focus();
      } catch (error) {
        addMessage('eve', `Microphone transcription failed: ${error.message}`);
      } finally {
        isTranscribing = false;
        setControlsDisabled(false);
      }
    });

    mediaRecorder.start();
    setMicState(true);
  } catch (error) {
    addMessage('eve', `Microphone access failed: ${error.message}`);
    setMicState(false);
  }
}

async function startMultistream() {
  const targets = getPlatformConfig().map(({ name, enabledInput, urlInput, keyInput }) => ({
    name,
    rtmpUrl: urlInput.value.trim(),
    streamKey: keyInput.value.trim(),
    enabled: !!enabledInput.checked,
  }));

  const enabledTargets = targets.filter((t) => t.enabled);
  if (enabledTargets.length === 0) {
    throw new Error('Enable at least one platform before starting.');
  }

  const missingConfig = enabledTargets.filter((t) => !(t.rtmpUrl && t.streamKey));
  if (missingConfig.length > 0) {
    throw new Error(`Missing URL or key for: ${missingConfig.map((t) => t.name).join(', ')}`);
  }

  const response = await fetch('/api/multistream/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputUrl: inputUrl.value.trim(),
      sobuPngUrl: sobuPngUrlInput.value.trim(),
      targets,
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? 'Failed to start multistream.');
  multistreamStatus.textContent = `Multistream active (${enabledTargets.map((t) => t.name).join(' / ')} relay started).`;
}

async function stopMultistream() {
  const response = await fetch('/api/multistream/stop', { method: 'POST' });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? 'Failed to stop multistream.');
  multistreamStatus.textContent = 'Multistream stopped.';
}

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    currentImageBase64 = event.target.result;
    imagePreview.src = currentImageBase64;
    imagePreviewContainer.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

removeImageBtn.addEventListener('click', () => {
  currentImageBase64 = null;
  imageUpload.value = '';
  imagePreview.src = '';
  imagePreviewContainer.classList.add('hidden');
});

promptInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

if (micButton) micButton.addEventListener('click', toggleRecording);

sobuPngUrlInput.addEventListener('change', () => {
  sobuPreview.src = sobuPngUrlInput.value.trim();
});

[
  enableYoutube,
  enableTwitch,
  enableTiktok,
  youtubeUrl,
  youtubeKey,
  twitchUrl,
  twitchKey,
  tiktokUrl,
  tiktokKey,
].forEach((element) => {
  element.addEventListener('input', refreshPlatformChecklist);
  element.addEventListener('change', updatePlatformInputsState);
});

startMultistreamBtn.addEventListener('click', async () => {
  try {
    await startMultistream();
  } catch (error) {
    multistreamStatus.textContent = `Start failed: ${error.message}`;
  }
});

stopMultistreamBtn.addEventListener('click', async () => {
  try {
    await stopMultistream();
  } catch (error) {
    multistreamStatus.textContent = `Stop failed: ${error.message}`;
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (isRecording && mediaRecorder) {
    mediaRecorder.stop();
    return;
  }

  const prompt = promptInput.value.trim();
  if (!prompt && !currentImageBase64) return;

  addMessage('user', prompt, currentImageBase64);

  const imageToSend = currentImageBase64;
  promptInput.value = '';
  currentImageBase64 = null;
  imagePreviewContainer.classList.add('hidden');
  imageUpload.value = '';
  setControlsDisabled(true);

  try {
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, image: imageToSend }),
    });

    const payload = await response.json();
    if (!response.ok) {
      addMessage('eve', `Error: ${payload.error ?? 'Unknown error'}`);
      return;
    }

    addMessage('eve', payload.responseText ?? 'No response text received.');
  } catch (error) {
    addMessage('eve', `Network error: ${error.message}`);
  } finally {
    setControlsDisabled(false);
    promptInput.focus();
  }
});

addMessage('eve', 'Web interface connected. Ready to multistream with Sobu-kun + エーヴェ様.');
updatePlatformInputsState();
