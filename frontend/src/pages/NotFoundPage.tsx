import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      <span aria-hidden="true" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -54%)',
        fontSize: 'clamp(140px, 30vw, 260px)',
        fontWeight: 900,
        lineHeight: 1,
        color: 'rgba(128,128,128,0.07)',
        userSelect: 'none',
        pointerEvents: 'none',
        letterSpacing: '-8px',
        zIndex: 0,
      }}>404</span>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 68,
          height: 68,
          borderRadius: '50%',
          border: '1px solid rgba(128,128,128,0.2)',
          background: 'rgba(128,128,128,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          fontSize: 28,
        }}>📍</div>

        <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 10 }}>
          Помилка 404
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.2 }}>
          Сторінку не знайдено
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 340, margin: '0 0 32px', lineHeight: 1.6 }}>
          Схоже, цієї сторінки не існує або її було переміщено.
          Перевірте адресу або повертайтесь на головну.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              fontSize: 14,
              fontWeight: 500,
              padding: '10px 24px',
              borderRadius: 8,
              background: '#111827',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ← На головну
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              fontSize: 14,
              padding: '10px 24px',
              borderRadius: 8,
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid rgba(128,128,128,0.25)',
              cursor: 'pointer',
            }}
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
