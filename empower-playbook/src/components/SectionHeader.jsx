export default function SectionHeader({ title, subtitle, style }) {
  return (
    <div className="section-header" style={style}>
      <h2>{title}</h2>
      <div className="section-divider"></div>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}
