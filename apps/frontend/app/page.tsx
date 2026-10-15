import Link from "next/link";
import   "./landing.css" 


const features = [
  {
    icon: "✎",
    title: "Draw anything",
    text: "Rectangles, circles, lines and freehand. A clean canvas that stays out of your way.",
  },
  {
    icon: "⚡",
    title: "Live collaboration",
    text: "Share a room link and watch everyone's strokes appear in real time.",
  },
  {
    icon: "☁",
    title: "Always saved",
    text: "Your shapes are stored, so you can come back to the same room anytime.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
         <div className="cc-page">
      

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
            <text x="296" y="242" fontSize="11" fill="#fff" textAnchor="middle">Sumit</text>
            <path d="M610 215 l0 22 l6 -6 l8 14 l5 -3 l-8 -14 l9 0 z" fill="#e0a458" />
            <rect x="622" y="233" width="44" height="20" rx="10" fill="#e0a458" />
            <text x="644" y="247" fontSize="11" fill="#fff" textAnchor="middle">Karan</text>
          </svg>
        </div>
      </section>

       <section className="cc-features">
        {features.map((f) => (
          <div key={f.title} className="cc-card">
            <div className="cc-card-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section> 

      <footer className="cc-footer">
        <span>© 2026 CoCanvas</span>
        <span>Built with Next.js and WebSockets</span>
      </footer>
    </div> 
    </div>
  );
}


