import { useState, useRef, useCallback } from 'react'
import { audioBufferToWav, exportCleanAudio, downloadBlob } from '../utils/audio'

let markIdSeq = 0

export default function UploadMode() {
  const [file, setFile] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [marks, setMarks] = useState([])
  const [exporting, setExporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const audioRef = useRef(null)
  const fileRef = useRef(null)

  const loadFile = useCallback((f) => {
    if (!f || !f.type.startsWith('audio/')) return
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    const url = URL.createObjectURL(f)
    setFile(f)
    setAudioUrl(url)
    setMarks([])
    setCurrentTime(0)
  }, [audioUrl])

  const onFileInput = (e) => {
    if (e.target.files[0]) loadFile(e.target.files[0])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0])
  }

  const markBadWord = () => {
    const t = audioRef.current?.currentTime ?? 0
    setMarks(prev => [...prev, { id: ++markIdSeq, time: t, label: `Mark at ${fmtTime(t)}` }])
  }

  const removeMark = (id) => setMarks(prev => prev.filter(m => m.id !== id))

  const handleExport = async () => {
    if (!file || marks.length === 0) return
    setExporting(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const audioCtx = new AudioContext()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      await audioCtx.close()

      const cleanBuffer = await exportCleanAudio(audioBuffer, marks, 1.5)
      const wavBuffer = audioBufferToWav(cleanBuffer)
      const blob = new Blob([wavBuffer], { type: 'audio/wav' })
      const baseName = file.name.replace(/\.[^.]+$/, '')
      downloadBlob(blob, `${baseName}-clean.wav`)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const fmtTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  return (
    <div className="mode-panel">
      {!file ? (
        <div
          className={`drop-zone ${dragOver ? 'drop-zone--over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <div className="drop-icon">&#9835;</div>
          <p>Drop an audio file here, or click to browse</p>
          <p className="drop-hint">MP3, WAV, OGG, M4A, AAC</p>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={onFileInput}
          />
        </div>
      ) : (
        <>
          <div className="file-header">
            <span className="file-name">{file.name}</span>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => { setFile(null); setAudioUrl(null); setMarks([]) }}
            >
              Change file
            </button>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="audio-player"
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
          />

          <div className="timeline-wrap">
            <div className="timeline-track">
              {duration > 0 && marks.map(m => (
                <div
                  key={m.id}
                  className="timeline-mark-pin"
                  style={{ left: `${(m.time / duration) * 100}%` }}
                  title={fmtTime(m.time)}
                />
              ))}
              <div
                className="timeline-playhead"
                style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="timeline-labels">
              <span>{fmtTime(currentTime)}</span>
              <span>{fmtTime(duration)}</span>
            </div>
          </div>

          <div className="mark-controls">
            <button className="btn btn--danger" onClick={markBadWord}>
              Mark Bad Word Here
            </button>
            <span className="mark-hint">Press while the bad word is playing to drop a mute marker</span>
          </div>

          {marks.length > 0 && (
            <div className="marks-list">
              <h3>Mute Markers ({marks.length})</h3>
              <p className="marks-subtext">Each marker silences ±1.5 seconds around that timestamp.</p>
              <ul>
                {marks.map(m => (
                  <li key={m.id} className="mark-item">
                    <span className="mark-time">{fmtTime(m.time)}</span>
                    <span className="mark-range">
                      ({fmtTime(Math.max(0, m.time - 1.5))} – {fmtTime(m.time + 1.5)})
                    </span>
                    <button
                      className="btn btn--ghost btn--sm mark-remove"
                      onClick={() => removeMark(m.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              <button
                className="btn btn--primary btn--lg"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? 'Exporting…' : 'Export Clean Audio (WAV)'}
              </button>
            </div>
          )}

          <div className="info-box">
            <h3>How to use</h3>
            <ol>
              <li>Play the song using the player above.</li>
              <li>When you hear a bad word, click <strong>Mark Bad Word Here</strong>.</li>
              <li>Repeat for every word you want removed.</li>
              <li>Click <strong>Export Clean Audio</strong> to download a WAV with those sections silenced.</li>
            </ol>
            <p className="info-note">
              <strong>Tip:</strong> You can replay sections to mark precisely — the player timestamp
              is used when you click Mark. Use &ldquo;Remove&rdquo; to undo a mis-timed mark.
            </p>
            <p className="info-note">
              <strong>Phase 2 note:</strong> Automatic detection for upload mode requires a Whisper
              or AssemblyAI API key. See NOTES.md for integration details.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
