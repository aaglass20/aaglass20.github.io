import { useState, useRef, useEffect, useCallback } from 'react'
import { containsExplicit } from '../data/wordList'

const BUFFER_SECONDS = 10
// Speech recognition fires ~0.5s after the word is spoken.
// Schedule the mute to coincide with when that word reaches the delayed output.
const MUTE_SCHEDULE_DELAY_MS = (BUFFER_SECONDS * 1000) - 500
const MUTE_DURATION_MS = 2200

export default function LiveMode() {
  const [status, setStatus] = useState('idle') // idle | running | muted | error | no-api
  const [muteCount, setMuteCount] = useState(0)
  const [log, setLog] = useState([])
  const [errorMsg, setErrorMsg] = useState('')

  const audioCtxRef = useRef(null)
  const gainRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const isRunningRef = useRef(false)
  const muteTimeoutsRef = useRef([])
  const statusRef = useRef('idle')

  const scheduleStatus = (newStatus) => {
    setStatus(newStatus)
    statusRef.current = newStatus
  }

  const scheduleMute = useCallback(() => {
    const t = setTimeout(() => {
      if (!gainRef.current || !audioCtxRef.current) return
      gainRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime)
      scheduleStatus('muted')
      setMuteCount(c => c + 1)

      const unmute = setTimeout(() => {
        if (!gainRef.current || !audioCtxRef.current) return
        gainRef.current.gain.linearRampToValueAtTime(1, audioCtxRef.current.currentTime + 0.1)
        if (isRunningRef.current) scheduleStatus('running')
      }, MUTE_DURATION_MS)

      muteTimeoutsRef.current.push(unmute)
    }, MUTE_SCHEDULE_DELAY_MS)

    muteTimeoutsRef.current.push(t)
  }, [])

  const addLog = useCallback((word) => {
    setLog(prev => [...prev.slice(-39), { word, time: new Date().toLocaleTimeString() }])
  }, [])

  const startSession = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      scheduleStatus('no-api')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx

      const source = audioCtx.createMediaStreamSource(stream)
      const delay = audioCtx.createDelay(BUFFER_SECONDS)
      delay.delayTime.value = BUFFER_SECONDS
      const gain = audioCtx.createGain()
      gainRef.current = gain

      source.connect(delay)
      delay.connect(gain)
      gain.connect(audioCtx.destination)

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognitionRef.current = recognition

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const found = containsExplicit(transcript)
          if (found) {
            scheduleMute()
            addLog(found)
            break
          }
        }
      }

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech') console.warn('STT error:', e.error)
      }

      recognition.onend = () => {
        if (isRunningRef.current) {
          try { recognition.start() } catch (_) {}
        }
      }

      recognition.start()
      isRunningRef.current = true
      scheduleStatus('running')
    } catch (err) {
      setErrorMsg(err.message || 'Microphone access denied.')
      scheduleStatus('error')
    }
  }

  const stopSession = useCallback(() => {
    isRunningRef.current = false
    recognitionRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
    muteTimeoutsRef.current.forEach(clearTimeout)
    muteTimeoutsRef.current = []
    gainRef.current = null
    audioCtxRef.current = null
    streamRef.current = null
    scheduleStatus('idle')
  }, [])

  useEffect(() => () => stopSession(), [stopSession])

  const isRunning = status === 'running' || status === 'muted'

  return (
    <div className="mode-panel">
      <div className="live-status-bar">
        <span className={`status-dot status-dot--${status}`} />
        <span className="status-label">
          {status === 'idle' && 'Ready'}
          {status === 'running' && 'Listening — audio delayed 10s'}
          {status === 'muted' && 'MUTING'}
          {status === 'error' && 'Error'}
          {status === 'no-api' && 'Browser not supported'}
        </span>
        <span className="mute-badge">
          {muteCount > 0 && `${muteCount} mute${muteCount !== 1 ? 's' : ''}`}
        </span>
      </div>

      {status === 'no-api' && (
        <div className="alert alert--warn">
          Web Speech API is not available. Use Chrome or Edge.
        </div>
      )}

      {status === 'error' && (
        <div className="alert alert--error">
          {errorMsg || 'Could not access microphone.'}
        </div>
      )}

      <div className="live-controls">
        {!isRunning ? (
          <button className="btn btn--primary btn--lg" onClick={startSession}>
            Start Live Scrub
          </button>
        ) : (
          <button className="btn btn--danger btn--lg" onClick={stopSession}>
            Stop
          </button>
        )}
      </div>

      <div className="info-box">
        <h3>How it works</h3>
        <ol>
          <li>Audio plays through a 10-second buffer before reaching the speakers.</li>
          <li>Speech recognition listens to the live input and detects explicit words.</li>
          <li>When a word is found, the output is muted just before that word would play.</li>
          <li>Audio resumes automatically after ~2 seconds.</li>
        </ol>
        <p className="info-note">
          <strong>Stadium setup:</strong> Route your DJ software or playlist output through a
          virtual audio cable (BlackHole on Mac, VB-Cable on Windows), then select that cable
          as your browser&apos;s microphone input. This gives Stadium Edit control of the audio
          before it hits the PA system.
        </p>
        <p className="info-note">
          <strong>Accuracy note:</strong> The built-in speech engine works best on clear vocals.
          Heavy beats and layered production reduce detection accuracy. See NOTES.md for
          Phase 2 AI options.
        </p>
      </div>

      {log.length > 0 && (
        <div className="detection-log">
          <h3>Detection Log</h3>
          <ul>
            {[...log].reverse().map((entry, i) => (
              <li key={i}>
                <span className="log-time">{entry.time}</span>
                <span className="log-word">"{entry.word}" detected — muted</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
