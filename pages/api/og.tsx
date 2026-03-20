import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

export default function handler(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #050a0e 0%, #0a1520 50%, #050a0e 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }} />

        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,47,247,0.1) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Logo badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 22, color: '#fff',
          }}>AC</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#e8f4fd', fontWeight: 700, fontSize: 20 }}>Aditya Chotaliya</span>
            <span style={{ color: '#4d7a9e', fontSize: 14, marginTop: 2 }}>adityachotaliya9299-jpg</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 36 }}>
          <span style={{ color: '#e8f4fd', fontWeight: 800, fontSize: 56, lineHeight: 1.1, letterSpacing: '-1px' }}>
            Blockchain Developer
          </span>
          <span style={{ color: '#00d4ff', fontWeight: 800, fontSize: 56, lineHeight: 1.1, letterSpacing: '-1px' }}>
            & Smart Contract Engineer
          </span>
        </div>

        {/* Tagline */}
        <p style={{ color: '#8bacc8', fontSize: 22, lineHeight: 1.5, maxWidth: 700, margin: 0 }}>
          DeFi Protocols · NFT Ecosystems · Web3 Full-Stack · MARL Research
        </p>

        {/* Pills row */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          {['Solidity', 'Foundry', 'Next.js', 'DeFi', 'MARL'].map(tag => (
            <div key={tag} style={{
              padding: '6px 16px',
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 6,
              color: '#00d4ff',
              fontSize: 15,
              fontFamily: 'monospace',
              display: 'flex',
            }}>{tag}</div>
          ))}
        </div>

        {/* Available badge */}
        <div style={{
          position: 'absolute', bottom: 64, right: 80,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 20px',
          background: 'rgba(0,230,118,0.08)',
          border: '1px solid rgba(0,230,118,0.25)',
          borderRadius: 8,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e676', display: 'flex' }} />
          <span style={{ color: '#00e676', fontSize: 15, fontWeight: 600 }}>Available for Freelance</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}