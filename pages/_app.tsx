import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '../components/ThemeContext';
import '../styles/globals.css';
import '../styles/animations.css';

function ReadProgressBar() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setWidth(Math.min(pct, 100));
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <div className="progress-bar" style={{ width: `${width}%` }} />;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <ReadProgressBar />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}