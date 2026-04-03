import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#020617',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
        }}
      >
        {/* Logo header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: '#2563eb',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 700,
              color: 'white',
            }}
          >
            DF
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: 'white',
            }}
          >
            DocForge
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 60,
            gap: 20,
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              maxWidth: 800,
            }}
          >
            Generate PDFs from HTML templates via API
          </h1>
          <p
            style={{
              fontSize: 28,
              color: '#94a3b8',
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            Premium document generation API for invoices, proposals, and branded PDFs
          </p>
        </div>

        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: '#2563eb',
          }}
        />

        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 80,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
