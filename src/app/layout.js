import "../styles/globals.css";

export const metadata = {
  title: "2025 사진 DAC",
  description: "2025 사진 DAC eTL",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
