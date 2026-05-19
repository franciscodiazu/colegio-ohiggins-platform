export default function TopNavTabs({ items, activeKey, onChange }) {
  return (
    <nav className="coh-nav-bar" aria-label="Navegacion principal">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`coh-nav-btn ${activeKey === item.key ? 'active' : ''}`}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
