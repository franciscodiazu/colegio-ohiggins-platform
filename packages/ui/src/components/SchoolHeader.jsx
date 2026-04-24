export default function SchoolHeader({ title, subtitle }) {
  return (
    <header className="coh-header">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}
