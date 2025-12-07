export default function Header({ title }: { title: string }) {
  return (
    <div className="header">
      <h2>{title}</h2>
    </div>
  );
}
