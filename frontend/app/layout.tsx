import "../styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ display: "flex" }}>{children}</body>
    </html>
  );
}
