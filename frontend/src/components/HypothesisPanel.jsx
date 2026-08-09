import { Layers } from 'lucide-react';

export default function HypothesisPanel({ confidenceData, hypothesesData }) {
  return (
    <aside className="hyp-panel">
      {confidenceData && (
        <section className="hyp-section">
          <h2>
            <Layers className="w-4 h-4" />
            Rollback recommendation
          </h2>

          <div className="confidence-card">
            <div>
              <span className="conf-label">Confidence</span>
              <span className="conf-sub">Gemini + Claude verified</span>
            </div>
            <span className="conf-score">{confidenceData.total_confidence}%</span>
          </div>

          <h3>Signal breakdown</h3>
          <ul className="signal-list">
            {(confidenceData.signals || []).map((sig, idx) => (
              <li key={idx}>
                <span>{sig.signal}</span>
                <span className="signal-score">+{sig.score}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hypothesesData && (
        <section className="hyp-section">
          <h3>Ranked hypotheses</h3>
          <div className="hyp-list">
            {(hypothesesData.hypotheses || []).map((hyp, idx) => (
              <article key={idx} className={`hyp-card ${hyp.selected ? 'selected' : ''}`}>
                <div className="hyp-top">
                  <span className="hyp-label">{hyp.label}</span>
                  <div className="hyp-badges">
                    {hyp.selected ? <span className="rank-pill">Rank 1</span> : null}
                    <span className="hyp-pct">{hyp.confidence}%</span>
                  </div>
                </div>
                {hyp.selected && hyp.description ? (
                  <p className="hyp-desc">{hyp.description}</p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
