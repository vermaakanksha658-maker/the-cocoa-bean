import './Wave.css';

export default function Wave({ fill, bg }) {
  return (
    <div className="wave" style={{ background: bg }} aria-hidden="true">
      <svg viewBox="0 0 1440 64" preserveAspectRatio="none">
        <path d="M0,0 C360,52 1080,52 1440,0 L1440,64 L0,64 Z" fill={fill} />
      </svg>
    </div>
  );
}