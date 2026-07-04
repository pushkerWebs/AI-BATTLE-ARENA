// Reusable Material Symbols Outlined icon component
export default function Icon({ n, fill = false, size = 24, style: s = {}, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-block',
        fontVariationSettings: fill
          ? "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24"
          : "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24",
        ...s,
      }}
    >
      {n}
    </span>
  )
}
