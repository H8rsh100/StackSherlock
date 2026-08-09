import { CheckCircle, GitCommit, XCircle } from 'lucide-react';

export default function ActionBar({
  playbookData,
  approvalStatus,
  arizeData,
  mrUrl,
  onApprove,
  onReject,
  onOpenAudit,
}) {
  const steps = playbookData?.steps || [];
  const advancing = approvalStatus === 'validating' || approvalStatus === 'resolved';

  return (
    <footer className="action-bar">
      <div className="action-left">
        <div className="playbook-id">
          Playbook
          <code>{playbookData?.playbook_id || 'LOADING...'}</code>
        </div>

        <ul className="step-rail">
          {steps.map((step, idx) => {
            let state = 'waiting';
            if (idx < 2) state = 'done';
            else if (idx === 2) state = advancing ? 'done' : 'pending';
            else if (approvalStatus === 'resolved') state = 'done';

            return (
              <li key={idx} className={`step-chip ${state}`}>
                {state === 'done' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <span className="step-marker">{idx === 2 && state === 'pending' ? '→' : '○'}</span>
                )}
                <span>
                  {idx + 1}. {step}
                </span>
                <span className="step-state">
                  {state === 'done' ? (idx === 2 ? 'Executed' : 'Done') : state === 'pending' ? 'Pending' : 'Waiting'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="action-right">
        {approvalStatus === 'idle' && (
          <div className="action-buttons">
            <button type="button" className="btn-ghost" onClick={onOpenAudit}>
              Why should I trust this?
            </button>
            <button type="button" className="btn-danger-ghost" onClick={onReject}>
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button type="button" className="btn-approve" onClick={onApprove}>
              <GitCommit className="w-4 h-4" />
              Approve & execute
            </button>
          </div>
        )}

        {approvalStatus === 'rejected' && (
          <div className="status-banner rejected">
            <XCircle className="w-6 h-6" />
            <div>
              <strong>Recommendation rejected</strong>
              <p>No GitLab action was taken. Switch scenario or re-trigger to investigate again.</p>
            </div>
          </div>
        )}

        {approvalStatus === 'validating' && arizeData && (
          <div className="status-banner validating">
            <span className="pulse-dot" />
            <div className="validate-copy">
              <strong>Post-fix validation</strong>
              <div className="validate-metrics">
                <span>Error rate</span>
                <span className="amber">{arizeData.post_fix_error_rate}%</span>
                <span className="dim">to</span>
                <span className="emerald">baseline &lt; 2.0%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${(arizeData.baseline_held_seconds / 60) * 100}%` }}
                />
              </div>
              <span className="held">
                Stability held {arizeData.baseline_held_seconds}s / 60s
              </span>
            </div>
          </div>
        )}

        {approvalStatus === 'resolved' && (
          <div className="status-banner resolved">
            <CheckCircle className="w-6 h-6" />
            <div>
              <strong>Incident resolved & learned</strong>
              <p>
                Telemetry held below baseline for 60s. Rollback succeeded
                {mrUrl ? (
                  <>
                    {' '}
                    (
                    <a href={mrUrl} target="_blank" rel="noreferrer">
                      view MR
                    </a>
                    )
                  </>
                ) : null}
                . Memory stored in MongoDB.
              </p>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
