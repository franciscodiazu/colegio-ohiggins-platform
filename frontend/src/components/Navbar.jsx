const DEFAULT_ITEMS = [
	{ key: 'estudiantes', label: 'Estudiantes' },
	{ key: 'asistencia', label: 'Asistencia' },
	{ key: 'evaluaciones', label: 'Evaluaciones y Notas' },
];

export default function Navbar({ items = DEFAULT_ITEMS, activeKey, onChange }) {
	return (
		<nav className="nav-bar" aria-label="Navegacion principal del sistema">
			{items.map((item) => {
				const isActive = activeKey === item.key;

				return (
					<button
						key={item.key}
						type="button"
						className={`nav-btn ${isActive ? 'active' : ''}`}
						onClick={() => onChange(item.key)}
						aria-current={isActive ? 'page' : undefined}
					>
						{item.label}
					</button>
				);
			})}
		</nav>
	);
}
