import { ArrowRight, GitBranch, Radar, ShieldCheck } from 'lucide-react';

const pillars = [
  {
    icon: Radar,
    title: 'Detect & correlate',
    body: 'Pull Elastic logs, GitLab deploys, and Mongo history into one investigation thread.',
  },
  {
    icon: GitBranch,
    title: 'Explain the cascade',
    body: 'Build a ranked root-cause chain with confidence signals you can audit before acting.',
  },
  {
    icon: ShieldCheck,
    title: 'Approve once',
    body: 'Human gate before GitLab rollback. Arize validates recovery, then memory learns.',
  },
];

export default function Landing({ onEnter, backendOnline }) {
  return (
    <div className="landing-shell">
      <div className="landing-grid" aria-hidden="true" />

      <nav className="landing-nav">
        <div className="brand-mark">
          <span className="brand-glyph" aria-hidden="true" />
          <span className="brand-word">StackSherlock</span>
        </div>
        <div className={`status-chip ${backendOnline ? 'online' : 'offline'}`}>
          <span className="status-dot" />
          {backendOnline ? 'API online' : 'API offline'}
        </div>
      </nav>

      <section className="landing-hero">
        <p className="hero-kicker">Autonomous Incident Command</p>
        <h1 className="hero-brand">StackSherlock</h1>
        <p className="hero-line">
          Observability tells you what failed. StackSherlock finds why, proposes the fix,
          and executes after one approval.
        </p>
        <div className="hero-actions">
          <button type="button" className="cta-primary" onClick={onEnter}>
            Open command center
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            className="cta-secondary"
            href="https://github.com/H8rsh100/StackSherlock"
            target="_blank"
            rel="noreferrer"
          >
            View source
          </a>
        </div>
      </section>

      <section className="landing-pillars">
        {pillars.map(({ icon: Icon, title, body }) => (
          <article key={title} className="pillar">
            <Icon className="pillar-icon" strokeWidth={1.75} />
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
