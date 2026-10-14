import Link from "next/link";

const css = `
  .cc-page {
    --bg: #faf9f7;
    --ink: #1c1b22;
    --muted: #6b6a75;
    --accent: #6965db;
    --accent-soft: #eceaff;
    --line: #e6e4df;
    min-height: 100vh;
    background: var(--bg);
    color: var(--ink);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    background-image: radial-gradient(#e3e1db 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .cc-nav {
    max-width: 1080px;
    margin: 0 auto;
    padding: 24px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cc-logo { font-weight: 700; font-size: 20px; letter-spacing: -0.02em; }
  .cc-logo span { color: var(--accent); }
  .cc-nav-links { display: flex; gap: 12px; align-items: center; }
  .cc-link { color: var(--muted); text-decoration: none; font-size: 15px; padding: 8px 12px; }
  .cc-link:hover { color: var(--ink); }
  .cc-btn {
    display: inline-block;
    padding: 12px 22px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .cc-btn:hover { transform: translateY(-2px); }
  .cc-btn-primary { background: var(--accent); color: #fff; box-shadow: 0 6px 18px rgba(105, 101, 219, 0.35); }
  .cc-btn-ghost { background: #fff; color: var(--ink); border: 1px solid var(--line); }
  .cc-hero {
    max-width: 760px;
    margin: 0 auto;
    padding: 56px 20px 24px;
    text-align: center;
  }
  .cc-badge {
    display: inline-block;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 13px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 999px;
    margin-bottom: 22px;
  }
  .cc-title {
    font-size: clamp(38px, 7vw, 64px);
    line-height: 1.05;
    letter-spacing: -0.035em;
    font-weight: 800;
    margin: 0 0 18px;
  }
  .cc-title em { font-style: normal; color: var(--accent); }
  .cc-sub { font-size: 18px; line-height: 1.6; color: var(--muted); margin: 0 auto 32px; max-width: 540px; }
  .cc-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .cc-preview {
    max-width: 880px;
    margin: 48px auto 0;
    padding: 0 20px;
  }
  .cc-window {
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 18px;
    box-shadow: 0 24px 60px rgba(28, 27, 34, 0.08);
    overflow: hidden;
  }
  .cc-window-bar {
    display: flex;
    gap: 7px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--line);
  }
  .cc-dot { width: 11px; height: 11px; border-radius: 50%; background: #e6e4df; }
  .cc-window svg { display: block; width: 100%; height: auto; }
  .cc-features {
    max-width: 1080px;
    margin: 80px auto 0;
    padding: 0 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }
  .cc-card {
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 26px;
  }
  .cc-card-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: var(--accent-soft);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 16px;
  }
  .cc-card h3 { margin: 0 0 8px; font-size: 18px; letter-spacing: -0.01em; }
  .cc-card p { margin: 0; color: var(--muted); line-height: 1.6; font-size: 15px; }
  .cc-footer {
    max-width: 1080px;
    margin: 96px auto 0;
    padding: 28px 20px 40px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    color: var(--muted);
    font-size: 14px;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
         <div className="cc-page">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav className="cc-nav">
        <div className="cc-logo">
          Co<span>Canvas</span>
        </div>
        <div className="cc-nav-links">
          <Link href="/signin" className="cc-link">
            Sign in
          </Link>
          <Link href="/signup" className="cc-btn cc-btn-primary">
            Get started
          </Link>
        </div>
      </nav>

      <section className="cc-hero">
        <span className="cc-badge">Real-time whiteboard</span>
        <h1 className="cc-title">
          Sketch ideas <em>together</em>, instantly.
        </h1>
        <p className="cc-sub">
          CoCanvas is a simple shared canvas where you and your team can draw,
          brainstorm and think out loud in real time.
        </p>
        <div className="cc-cta">
          <Link href="/signup" className="cc-btn cc-btn-primary">
            Start drawing
          </Link>
          <Link href="/signin" className="cc-btn cc-btn-ghost">
            Join a room
          </Link>
        </div>
      </section>

      <section className="cc-preview">
        <div className="cc-window">
          <div className="cc-window-bar">
            <span className="cc-dot" />
            <span className="cc-dot" />
            <span className="cc-dot" />
          </div>
          <svg viewBox="0 0 880 380" role="img" aria-label="Canvas preview">
            <rect x="90" y="70" width="220" height="130" rx="14" fill="none" stroke="#6965db" strokeWidth="3" />
            <circle cx="520" cy="150" r="70" fill="#eceaff" stroke="#6965db" strokeWidth="3" />
            <path d="M310 135 L450 150" stroke="#1c1b22" strokeWidth="3" strokeLinecap="round" />
            <path d="M200 280 Q 330 230 460 290 T 740 270" fill="none" stroke="#1c1b22" strokeWidth="3" strokeLinecap="round" />
            <rect x="650" y="70" width="140" height="90" rx="12" fill="none" stroke="#e0a458" strokeWidth="3" />
            <path d="M262 210 l0 22 l6 -6 l8 14 l5 -3 l-8 -14 l9 0 z" fill="#6965db" />
            <rect x="274" y="228" width="44" height="20" rx="10" fill="#6965db" />
            <text x="296" y="242" fontSize="11" fill="#fff" textAnchor="middle">Ajij</text>
            <path d="M610 215 l0 22 l6 -6 l8 14 l5 -3 l-8 -14 l9 0 z" fill="#e0a458" />
            <rect x="622" y="233" width="44" height="20" rx="10" fill="#e0a458" />
            <text x="644" y="247" fontSize="11" fill="#fff" textAnchor="middle">Karan</text>
          </svg>
        </div>
      </section>

      {/* <section className="cc-features">
        {features.map((f) => (
          <div key={f.title} className="cc-card">
            <div className="cc-card-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section> */}

      <footer className="cc-footer">
        <span>© 2026 CoCanvas</span>
        <span>Built with Next.js and WebSockets</span>
      </footer>
    </div> 
    </div>
  );
}


