import { useState, useEffect, useRef } from 'react'
import { locations as locationsDb } from '../lib/db'

export default function Locations() {
  const [locs, setLocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name: '', address: '', notes: '', lat: null, lon: null, image: null })
  const [mapVisible, setMapVisible] = useState(false)
  const [mapUrl, setMapUrl] = useState('')
  const [mapStatus, setMapStatus] = useState({ type: '', msg: '' })
  const geocodeTimer = useRef(null)
  const nameRef = useRef(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setLocs(await locationsDb.list()) }
    catch { setLocs([]) }
    finally { setLoading(false) }
  }

  function openAdd() {
    setEditing(null)
    setForm({ name: '', address: '', notes: '', lat: null, lon: null, image: null })
    setMapVisible(false)
    setMapUrl('')
    setMapStatus({ type: '', msg: '' })
    setFormOpen(true)
    setTimeout(() => nameRef.current?.focus(), 50)
  }

  function openEdit(loc) {
    setEditing(loc.id)
    setForm({ name: loc.name || '', address: loc.address || '', notes: loc.notes || '', lat: loc.lat || null, lon: loc.lon || null, image: loc.image || null })
    if (loc.lat && loc.lon) {
      setMapUrl(buildMapUrl(loc.lat, loc.lon))
      setMapVisible(true)
    } else {
      setMapVisible(false)
      setMapUrl('')
    }
    setMapStatus({ type: '', msg: '' })
    setFormOpen(true)
    setViewOpen(false)
    setTimeout(() => nameRef.current?.focus(), 50)
  }

  function closeForm() {
    setFormOpen(false)
    clearTimeout(geocodeTimer.current)
  }

  function openView(loc) {
    setViewing(loc)
    setViewOpen(true)
  }

  function closeView() {
    setViewOpen(false)
    setViewing(null)
  }

  function buildMapUrl(lat, lon) {
    const d = 0.009
    const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
  }

  function onAddressChange(val) {
    setForm(f => ({ ...f, address: val }))
    clearTimeout(geocodeTimer.current)
    if (val.trim().length >= 6) {
      geocodeTimer.current = setTimeout(() => geocode(val), 1400)
    } else {
      setMapVisible(false)
      setMapStatus({ type: '', msg: '' })
    }
  }

  async function geocode(addr) {
    if (!addr?.trim()) return
    setMapStatus({ type: 'loading', msg: '🔍 Looking up address…' })
    try {
      const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(addr)
      const res = await fetch(url, { headers: { 'Accept-Language': 'en-US,en' } })
      const data = await res.json()
      if (!data.length) {
        setMapStatus({ type: 'err', msg: '❌ Address not found — try a more specific address' })
        setMapVisible(false)
        return
      }
      const lat = parseFloat(data[0].lat)
      const lon = parseFloat(data[0].lon)
      setForm(f => ({ ...f, lat, lon }))
      setMapUrl(buildMapUrl(lat, lon))
      setMapVisible(true)
      setMapStatus({ type: 'ok', msg: '✅ ' + data[0].display_name })
    } catch {
      setMapStatus({ type: 'err', msg: '⚠️ Could not reach map service' })
    }
  }

  function handleImageFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }))
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await locationsDb.save({ id: editing || undefined, name: form.name.trim(), address: form.address.trim(), notes: form.notes.trim(), lat: form.lat, lon: form.lon, image: form.image })
      closeForm()
      await load()
    } catch (err) {
      console.error('[Locations] save:', err)
      alert('Could not save — please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(loc) {
    if (!confirm(`Delete "${loc.name}"? Programs using this location will not be affected.`)) return
    await locationsDb.delete(loc.id)
    await load()
  }

  const canSave = form.name.trim().length > 0

  return (
    <main>
      <section className="hero" style={{ padding: '2.5rem 1.5rem 3rem' }}>
        <div className="hero-badge">📍 Locations</div>
        <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)' }}>Manage <span>Locations</span></h1>
        <p style={{ fontSize: '.97rem' }}>Save facilities and fields used across your programs.</p>
      </section>

      <div className="container-wide">
        <div className="pg">
          <div className="pg-header">
            <div>
              <div className="pg-title">Locations</div>
              <div className="pg-sub">Add facilities, fields, and courts — then assign them to programs.</div>
            </div>
            <button className="btn-add" data-testid="add-location-btn" onClick={openAdd}>+ Add Location</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading…</div>
          ) : locs.length === 0 ? (
            <div className="empty-state" data-testid="locations-empty">
              <span className="es-icon">📍</span>
              <div className="es-title">No locations yet</div>
              <div className="es-sub">Add your first facility so you can assign it to a program.</div>
              <button className="btn-add" onClick={openAdd}>+ Add Location</button>
            </div>
          ) : (
            <div data-testid="locations-home">
              <div className="locs-grid">
                {locs.map(loc => (
                  <div className="loc-card" key={loc.id}>
                    {loc.image
                      ? <img className="loc-img" src={loc.image} alt="" loading="lazy" />
                      : <div className="loc-img-placeholder">📍</div>}
                    <div className="loc-body">
                      <div className="loc-name">{loc.name}</div>
                      {loc.address && (
                        <div className="loc-address"><span>📍</span><span>{loc.address}</span></div>
                      )}
                      {loc.notes && <div className="loc-notes">{loc.notes}</div>}
                    </div>
                    <div className="loc-footer">
                      <button className="btn-loc-edit" onClick={() => openView(loc)}>👁 View</button>
                      <button className="btn-loc-edit" onClick={() => openEdit(loc)}>✏️ Edit</button>
                      <button className="btn-loc-delete" onClick={() => handleDelete(loc)}>🗑 Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {formOpen && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) closeForm() }}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Location' : 'Add Location'}</span>
              <button className="modal-close" onClick={closeForm}>✕</button>
            </div>

            <div className="modal-body" data-testid="location-form">
              <div>
                <label className="field-label" htmlFor="locName">Location Name *</label>
                <input
                  ref={nameRef}
                  id="locName"
                  type="text"
                  className="field-input"
                  data-testid="location-form-name"
                  placeholder="e.g. Lincoln Rec Center"
                  maxLength={100}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="locAddress">Address</label>
                <div className="addr-row">
                  <input
                    id="locAddress"
                    type="text"
                    className="field-input"
                    placeholder="e.g. 123 Main St, Springfield, IL"
                    value={form.address}
                    onChange={e => onAddressChange(e.target.value)}
                  />
                  <button
                    className="btn-geocode"
                    disabled={!form.address.trim()}
                    onClick={() => geocode(form.address)}
                  >📍 Find</button>
                </div>
                {mapStatus.msg && (
                  <div className={`map-status visible ${mapStatus.type}`}>{mapStatus.msg}</div>
                )}
                {mapVisible && mapUrl && (
                  <div className="map-wrap visible" style={{ marginTop: '.6rem' }}>
                    <iframe src={mapUrl} title="Location map" loading="lazy" />
                  </div>
                )}
              </div>

              <div>
                <label className="field-label" htmlFor="locNotes">Notes</label>
                <textarea
                  id="locNotes"
                  className="field-textarea"
                  placeholder={'e.g. 2 basketball courts, 1 soccer field\nEntrance: rear parking lot door'}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <div>
                <label className="field-label">Photo <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span></label>
                {form.image ? (
                  <div className="img-preview-wrap visible">
                    <img className="img-preview" src={form.image} alt="Location" />
                    <button className="btn-img-remove" onClick={() => setForm(f => ({ ...f, image: null }))}>✕</button>
                  </div>
                ) : (
                  <div className="img-upload-area">
                    <input type="file" accept="image/*" onChange={handleImageFile} />
                    <span className="img-upload-icon">📷</span>
                    <div className="img-upload-label">Click to upload a photo</div>
                    <div className="img-upload-sub">JPG, PNG, GIF — stored locally</div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeForm}>Cancel</button>
              <button
                className="btn-save"
                data-testid="location-form-save"
                disabled={!canSave || saving}
                onClick={handleSave}
              >{saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Location'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewOpen && viewing && (
        <div className="view-overlay open" onClick={e => { if (e.target === e.currentTarget) closeView() }}>
          <div className="view-box">
            {viewing.image
              ? <img className="view-img" src={viewing.image} alt="" loading="lazy" />
              : <div className="view-img-placeholder">📍</div>}
            <div className="view-header">
              <div className="view-title">{viewing.name}</div>
              <button className="view-close-btn" onClick={closeView}>✕</button>
            </div>
            <div className="view-body">
              {viewing.address && (
                <div className="view-row"><span className="view-row-icon">📍</span><span className="view-row-text">{viewing.address}</span></div>
              )}
              {viewing.notes && (
                <div className="view-row"><span className="view-row-icon">📝</span><span className="view-row-text">{viewing.notes}</span></div>
              )}
              {viewing.lat && viewing.lon && (
                <div className="view-map-wrap">
                  <iframe src={buildMapUrl(viewing.lat, viewing.lon)} title="Map" loading="lazy" />
                </div>
              )}
              {!viewing.address && !viewing.notes && !viewing.lat && (
                <div style={{ color: 'var(--gray-400)', fontSize: '.9rem' }}>No additional details saved.</div>
              )}
            </div>
            <div className="view-footer">
              <button className="btn-view-close" onClick={closeView}>Close</button>
              <button className="btn-view-edit" onClick={() => openEdit(viewing)}>✏️ Edit</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
