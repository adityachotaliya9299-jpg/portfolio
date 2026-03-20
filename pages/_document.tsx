import { Html, Head, Main, NextScript } from 'next/document';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />

        {/* Theme */}
        <meta name="theme-color" content="#050a0e" />

        {/* ── OG / Social preview ── */}
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="Aditya Chotaliya" />
        <meta property="og:title"       content="Aditya Chotaliya — Blockchain Developer & Smart Contract Engineer" />
        <meta property="og:description" content="I help startups ship audited smart contracts, DeFi protocols, and NFT ecosystems — from architecture to mainnet. Open for freelance." />
        <meta property="og:image"       content="/api/og" />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt"   content="Aditya Chotaliya — Blockchain Developer" />

        {/* Twitter / X card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Aditya Chotaliya — Blockchain Developer" />
        <meta name="twitter:description" content="DeFi protocols · NFT ecosystems · Smart contract auditing · Web3 full-stack." />
        <meta name="twitter:image"       content="/api/og" />

        {/* Google Analytics — only loads when NEXT_PUBLIC_GA_ID is set */}
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}