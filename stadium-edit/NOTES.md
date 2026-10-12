# Stadium Edit — Enhancement Notes

## Detection Strategy Roadmap

### Phase 1 (current): Web Speech API + local word list
- **How:** Browser's built-in SpeechRecognition API, free, no key required
- **Limitation:** Designed for clean speech — accuracy drops when vocals are layered over a beat
- **Word matching:** Exact match against a curated local list (`src/data/wordList.js`)
- **Use case:** Good enough for clear/loud vocal tracks; misses words buried in heavy beats

---

### Phase 2 (future option): AI Speech-to-Text API

**AssemblyAI** (recommended for music)
- Real-time streaming STT with word-level timestamps
- ~$0.01/min; handles music better than generic STT
- API: `wss://api.assemblyai.com/v2/realtime/ws`
- Integration point: replace `SpeechRecognition` in `LiveMode.jsx` with WebSocket stream

**Deepgram**
- Also real-time streaming, similar pricing
- Has a `profanity_filter` param (auto-redaction) — could skip local word list entirely
- API: `wss://api.deepgram.com/v1/listen`

**OpenAI Whisper** (file-based only, not real-time)
- Best accuracy of the three
- Gives word-level timestamps — ideal for Upload mode
- Not suitable for live mode (inference latency too high for real-time)
- Cost: $0.006/min
- Integration point: `UploadMode.jsx` → send file to `/v1/audio/transcriptions` → map timestamps to mute list

---

### Phase 3 (future option): Source Separation before STT

The hardest part of music transcription is that vocals are mixed with instruments.
Separating them first dramatically improves STT accuracy.

**Demucs** (Meta AI) — best quality, Python CLI
- `python -m demucs --two-stems=vocals input.mp3`
- Outputs `vocals.wav` + `no_vocals.wav`
- Can run as a local server; web app sends file, gets back isolated vocal track

**Spleeter** (Deezer) — faster, slightly lower quality

**Integration point for Upload mode:**
1. User uploads MP3
2. Send to Demucs server → get `vocals.wav` back
3. Run Whisper on `vocals.wav` → get word timestamps
4. Apply mute to original file at those timestamps

This combo (Demucs + Whisper) would be near-perfect accuracy for a pre-process workflow.

---

## Known Limitations (Phase 1)

1. **System audio capture:** `getUserMedia` in browsers captures microphone only —
   not the system audio/DJ software output. For stadium use, a virtual audio cable
   is required (BlackHole on Mac, VB-Cable on Windows) to route DJ app → browser mic input.

2. **STT on music:** Web Speech API was trained on clean speech. Beat-heavy tracks
   with vocals mixed in will have high miss rates (~30-40% accuracy in testing).

3. **Per-word timestamps:** The Web Speech API returns utterance transcripts, not
   per-word timestamps. The 10-second buffer + scheduled mute is an approximation.
   Phase 2 (AssemblyAI/Deepgram) returns true word-level timestamps.

4. **HTTPS requirement:** `getUserMedia` requires HTTPS in production (GitHub Pages
   is HTTPS). Local Vite dev server is HTTP — Chrome allows localhost, but other
   browsers may block it.

5. **Export format:** Upload mode exports as WAV (lossless but large). MP3 export
   would require `lamejs` library. WAV is fine for a stadium PA system workflow.

---

## Future Feature Ideas

- [ ] Drag-and-drop playlist queue (process multiple songs in batch)
- [ ] Visual waveform display with marked segments highlighted in red
- [ ] "Beep" mode — substitute a tone instead of silence
- [ ] Adjustable mute window (currently ±1.5s around detected word)
- [ ] Custom word list editor in the UI (add/remove words without editing code)
- [ ] School-safe presets (more conservative vs. less conservative lists)
- [ ] Confidence threshold slider for speech recognition
