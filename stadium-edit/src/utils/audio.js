// Encode an AudioBuffer as a 16-bit PCM WAV file.
export function audioBufferToWav(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const numSamples = audioBuffer.length
  const dataLength = numSamples * numChannels * 2 // 16-bit = 2 bytes
  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)

  const write = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  write(0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  write(8, 'WAVE')
  write(12, 'fmt ')
  view.setUint32(16, 16, true)          // chunk size
  view.setUint16(20, 1, true)           // PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true) // byte rate
  view.setUint16(32, numChannels * 2, true)              // block align
  view.setUint16(34, 16, true)          // bits per sample
  write(36, 'data')
  view.setUint32(40, dataLength, true)

  let offset = 44
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]))
      view.setInt16(offset, sample * 0x7fff, true)
      offset += 2
    }
  }

  return buffer
}

// Render an AudioBuffer with silence (quick fade) over each marked timestamp window.
// marks: [{ time: number (seconds) }]
// window: seconds of silence on each side of the mark center
export async function exportCleanAudio(audioBuffer, marks, window = 1.5) {
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate,
  )

  const source = offlineCtx.createBufferSource()
  source.buffer = audioBuffer

  const gain = offlineCtx.createGain()
  gain.gain.setValueAtTime(1, 0)

  for (const mark of marks) {
    const start = Math.max(0, mark.time - window)
    const end = Math.min(audioBuffer.duration, mark.time + window)
    const fadeIn = 0.05
    gain.gain.setValueAtTime(1, start)
    gain.gain.linearRampToValueAtTime(0, start + fadeIn)
    gain.gain.setValueAtTime(0, end - fadeIn)
    gain.gain.linearRampToValueAtTime(1, end)
  }

  source.connect(gain)
  gain.connect(offlineCtx.destination)
  source.start(0)

  return offlineCtx.startRendering()
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
