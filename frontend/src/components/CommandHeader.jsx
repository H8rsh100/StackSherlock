import { ShieldAlert } from 'lucide-react';
import { SCENARIOS } from '../data/scenarios';

export default function CommandHeader({
  scenario,
  onScenarioChange,
  blastRadius,
  connectionState,
  onBack,
}) {
  return (
    <header className="cmd-header">
      <div className="cmd-header-left">
        <button type="button" className="brand-mini" onClick={onBack} title="Back to landing">
          <span className="brand-glyph sm" aria-hidden="true" />
          <span>StackSherlock</span>
        </button>

        <div className="sev-badge">
          <ShieldAlert className="w-4 h-4" />
          <span>P1 Critical</span>
        </div>

        <label className="scenario-picker">
          <span>Scenario</span>
          <select value={scenario} onChange={(e) => onScenarioChange(e.target.value)}>
            {Object.values(SCENARIOS).map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}: {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="cmd-header-right">
        <div className={`conn-pill ${connectionState}`}>
          <span className="status-dot" />
          {connectionState === 'live' ? 'Stream live' : connectionState === 'error' ? 'Stream error' : 'Connecting'}
        </div>

        {blastRadius && (
          <div className="blast-metrics">
            <div className="metric">
              <span className="metric-label">Services</span>
              <span className="metric-value rose">
                {(blastRadius.services || []).join(', ') || 'n/a'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Users</span>
              <span className="metric-value amber">
                {blastRadius.estimated_users?.toLocaleString?.() ?? 'n/a'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Loss / hr</span>
              <span className="metric-value rose">
                ${blastRadius.revenue_loss_per_hour?.toLocaleString?.() ?? '0'}
              </span>
            </div>
            <div className="sev-chip">{blastRadius.severity || 'P1'}</div>
          </div>
        )}
      </div>
    </header>
  );
}
