import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { api } from './api/client';
import { SCENARIOS } from './data/scenarios';
import Landing from './components/Landing';
import CommandHeader from './components/CommandHeader';
import FeedPanel from './components/FeedPanel';
import CausalGraph from './components/CausalGraph';
import HypothesisPanel from './components/HypothesisPanel';
import ActionBar from './components/ActionBar';
import AuditModal from './components/AuditModal';

export default function App() {
  const [view, setView] = useState('landing');
  const [backendOnline, setBackendOnline] = useState(false);
  const [scenario, setScenario] = useState('A');
  const [incidentId, setIncidentId] = useState('');
  const [feed, setFeed] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [blastRadius, setBlastRadius] = useState(null);
  const [hypothesesData, setHypothesesData] = useState(null);
  const [confidenceData, setConfidenceData] = useState(null);
  const [playbookData, setPlaybookData] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('idle');
  const [arizeData, setArizeData] = useState(null);
  const [mrUrl, setMrUrl] = useState(null);
  const [connectionState, setConnectionState] = useState('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [activeTab, setActiveTab] = useState('diff');
  const [errorBanner, setErrorBanner] = useState('');
  const [graphTick, setGraphTick] = useState(0);

  const intervalRef = useRef(null);

  const clearValidationLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchIncidentData = useCallback(async (incId) => {
    const [brData, hypData, confData, pbData, auditDataVal] = await Promise.all([
      api.blastRadius(incId),
      api.hypotheses(incId),
      api.confidence(incId),
      api.playbook(),
      api.audit(incId),
    ]);
    setBlastRadius(brData);
    setHypothesesData(hypData);
    setConfidenceData(confData);
    setPlaybookData(pbData);
    setAuditData(auditDataVal);
  }, []);

  const handleScenarioChange = useCallback(
    async (newScenario) => {
      clearValidationLoop();
      setScenario(newScenario);
      setFeed([]);
      setNodes([]);
      setEdges([]);
      setApprovalStatus('idle');
      setArizeData(null);
      setMrUrl(null);
      setIsModalOpen(false);
      setAuditData(null);
      setActiveTab('diff');
      setErrorBanner('');
      setConnectionState('connecting');
      setGraphTick((tick) => tick + 1);

      try {
        const data = await api.triggerIncident(newScenario);
        setIncidentId(data.incident_id);
        await fetchIncidentData(data.incident_id);
      } catch (e) {
        console.error(e);
        setErrorBanner('Could not reach the StackSherlock API. Start the backend on port 8000.');
        setBackendOnline(false);
        setConnectionState('error');
      }
    },
    [fetchIncidentData]
  );

  const enterCommandCenter = () => {
    setView('command');
    handleScenarioChange('A');
  };

  const startValidationPolling = useCallback((id) => {
    clearValidationLoop();
    intervalRef.current = setInterval(async () => {
      try {
        const data = await api.arizeStatus(id);
        setArizeData(data);
        if (data.incident_closed) {
          clearValidationLoop();
          setApprovalStatus('resolved');
          await api.learn(id);
        }
      } catch (e) {
        console.error(e);
        clearValidationLoop();
        setErrorBanner('Validation polling failed.');
      }
    }, 2000);
  }, []);

  const handleApprove = async () => {
    setApprovalStatus('validating');
    setErrorBanner('');
    try {
      const data = await api.approve(incidentId);
      setMrUrl(data?.gitlab_result?.mr_url || null);
      startValidationPolling(incidentId);
    } catch (e) {
      console.error(e);
      setApprovalStatus('idle');
      setErrorBanner('Approval failed. Check backend logs.');
    }
  };

  const handleReject = async () => {
    try {
      await api.reject(incidentId);
      setApprovalStatus('rejected');
      clearValidationLoop();
    } catch (e) {
      console.error(e);
      setErrorBanner('Reject failed.');
    }
  };

  useEffect(() => {
    let mounted = true;
    api
      .health()
      .then(() => {
        if (mounted) setBackendOnline(true);
      })
      .catch(() => {
        if (mounted) setBackendOnline(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => () => clearValidationLoop(), []);

  useEffect(() => {
    if (!incidentId || view !== 'command') return undefined;

    const eventSource = new EventSource(api.streamUrl(incidentId));

    eventSource.onopen = () => setConnectionState('live');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setFeed((prev) => [...prev, data]);
        setConnectionState('live');
      } catch (e) {
        console.error(e);
      }
    };
    eventSource.onerror = () => {
      setConnectionState('error');
      eventSource.close();
    };

    return () => eventSource.close();
  }, [incidentId, view]);

  useEffect(() => {
    if (view !== 'command' || graphTick === 0) return undefined;

    let timeoutId;
    let isSubscribed = true;
    const current = SCENARIOS[scenario];

    const animateGraph = async () => {
      await new Promise((resolve) => {
        timeoutId = setTimeout(resolve, 600);
      });
      if (!isSubscribed) return;

      for (let i = 0; i < current.nodes.length; i += 1) {
        if (!isSubscribed) break;
        setNodes((prev) => [...prev, current.nodes[i]]);
        if (i > 0) setEdges((prev) => [...prev, current.edges[i - 1]]);
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, 1100);
        });
      }
    };

    animateGraph();
    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
    };
  }, [scenario, view, graphTick]);

  if (view === 'landing') {
    return <Landing backendOnline={backendOnline} onEnter={enterCommandCenter} />;
  }

  return (
    <div className="command-shell">
      <CommandHeader
        scenario={scenario}
        onScenarioChange={handleScenarioChange}
        blastRadius={blastRadius}
        connectionState={connectionState}
        onBack={() => {
          clearValidationLoop();
          setView('landing');
        }}
      />

      {errorBanner ? <div className="error-banner">{errorBanner}</div> : null}

      <div className="command-grid">
        <FeedPanel feed={feed} loading={connectionState !== 'live' && feed.length === 0} />
        <CausalGraph scenario={scenario} nodes={nodes} edges={edges} />
        <HypothesisPanel confidenceData={confidenceData} hypothesesData={hypothesesData} />
      </div>

      <ActionBar
        playbookData={playbookData}
        approvalStatus={approvalStatus}
        arizeData={arizeData}
        mrUrl={mrUrl}
        onApprove={handleApprove}
        onReject={handleReject}
        onOpenAudit={() => setIsModalOpen(true)}
      />

      <AuditModal
        open={isModalOpen}
        auditData={auditData}
        incidentId={incidentId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
