import { useState } from 'react'

export default function TabGroup({ tabs, children }) {
  const [active, setActive] = useState(0)
  const panels = Array.isArray(children) ? children : [children]
  return (
    <>
      <div className="tab-bar" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            className={`tab-btn${i === active ? ' active' : ''}`}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-panel active">
        {panels[active]}
      </div>
    </>
  )
}
