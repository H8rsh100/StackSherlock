import { GitCommit } from 'lucide-react';

export default function AuditModal({ open, auditData, incidentId, activeTab, onTabChange, onClose }) {
  if (!open || !auditData) return null;

  const tabs = [
    { id: 'diff', label: 'Git diff' },
    { id: 'risk', label: 'Risk report' },
    { id: 'precedents', label: 'Precedents' },
  ];

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <header className="modal-head">
          <div className="modal-title">
            <span className="modal-icon">
              <GitCommit className="w-5 h-5" />
            </span>
            <div>
              <h3>Why should I trust this?</h3>
              <p>Multi-agent audit for {incidentId}</p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="modal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {activeTab === 'diff' && (
            <div className="tab-block">
              <p className="tab-hint">Suspicious changes in the deployment commit:</p>
              <pre>
                <code>{auditData.git_diff}</code>
              </pre>
            </div>
          )}

          {activeTab === 'risk' && auditData.claude_risk_assessment && (
            <div className="tab-block stack">
              <div className="risk-row">
                <span>Severity</span>
                <span
                  className={`risk-pill ${
                    auditData.claude_risk_assessment.risk_level === 'CRITICAL' ? 'critical' : 'high'
                  }`}
                >
                  {auditData.claude_risk_assessment.risk_level}
                </span>
              </div>
              <article>
                <h4>Claude SRE summary</h4>
                <p>{auditData.claude_risk_assessment.summary}</p>
              </article>
              <article>
                <h4>Impact analysis</h4>
                <p>{auditData.claude_risk_assessment.analysis}</p>
              </article>
            </div>
          )}

          {activeTab === 'precedents' && (
            <div className="tab-block stack">
              <p className="tab-hint">MongoDB learned-memory matches:</p>
              {(auditData.mongodb_precedents || []).map((prec, idx) => (
                <article key={idx} className="precedent-card">
                  <div className="precedent-top">
                    <span>{prec.incident_id}</span>
                    <span>{prec.date}</span>
                  </div>
                  <div className="precedent-grid">
                    <div>
                      <span className="metric-label">Scenario</span>
                      <strong>{prec.scenario}</strong>
                    </div>
                    <div>
                      <span className="metric-label">Resolution</span>
                      <strong>{prec.resolution}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="modal-foot">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Close audit
          </button>
        </footer>
      </div>
    </div>
  );
}
