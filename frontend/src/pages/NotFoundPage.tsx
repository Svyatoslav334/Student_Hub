import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.wrap}>
      <span className={styles.bgNum} aria-hidden="true">404</span>

      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <span className={styles.icon}>📍</span>
        </div>

        <p className={styles.eyebrow}>Помилка 404</p>
        <h1 className={styles.headline}>Сторінку не знайдено</h1>
        <p className={styles.sub}>
          Схоже, цієї сторінки не існує або її було переміщено.
          Перевірте адресу або повертайтесь на головну.
        </p>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => navigate('/')}>
            ← На головну
          </button>
          <button className={styles.btnGhost} onClick={() => navigate(-1)}>
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
