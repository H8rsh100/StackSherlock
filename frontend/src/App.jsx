import React, { useState, useEffect } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AlertCircle, CheckCircle, Activity, GitCommit } from 'lucide-react';

const scenarioANodes = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Deployment v2.3.1' }, style: { backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' } },
  { id: '2', position: { x: 250, y: 150 }, data: { label: 'Connection Pool Misconfigured' }, style: { backgroundColor: '#7c2d12', color: '#fed7aa', border: '1px solid #9a3412', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.2)' } },
  { id: '3', position: { x: 250, y: 250 }, data: { label: 'DB Connections Exhausted' }, style: { backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #b91c1c', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)' } },
  { id: '4', position: { x: 250, y: 350 }, data: { label: 'Auth Service Latency +840ms' }, style: { backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #b91c1c', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)' } },
  { id: '5', position: { x: 250, y: 450 }, data: { label: 'Checkout API Timeouts' }, style: { backgroundColor: '#991b1b', color: '#fef2f2', border: '1px solid #dc2626', padding: '12px', borderRadius: '8px', boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)' } },
];

const scenarioAEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#94a3b8' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#ef4444' } },
];

const scenarioBNodes = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Deployment v3.0.0' }, style: { backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' } },
  { id: '2', position: { x: 250, y: 150 }, data: { label: 'Redis Cache Miss Rate 80%' }, style: { backgroundColor: '#7c2d12', color: '#fed7aa', border: '1px solid #9a3412', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.2)' } },
  { id: '3', position: { x: 250, y: 250 }, data: { label: 'RedisTimeoutError' }, style: { backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #b91c1c', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)' } },
  { id: '4', position: { x: 250, y: 350 }, data: { label: 'Fallback to Primary DB CPU 100%' }, style: { backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #b91c1c', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)' } },
  { id: '5', position: { x: 250, y: 450 }, data: { label: 'Checkout API Timeouts' }, style: { backgroundColor: '#991b1b', color: '#fef2f2', border: '1px solid #dc2626', padding: '12px', borderRadius: '8px', boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)' } },
];

const scenarioBEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#94a3b8' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#ef4444' } },
];

export default function App() {
  const [scenario, setScenario] = useState('A');
  const [incidentId, setIncidentId] = useState('');
  const [feed, setFeed] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  const [blastRadius, setBlastRadius] = useState(null);
  const [hypothesesData, setHypothesesData] = useState(null);
  const [confidenceData, setConfidenceData] = useState(null);
  const [playbookData, setPlaybookData] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('idle'); // idle, validating, resolved
  const [arizeData, setArizeData] = useState(null);
  const intervalRef = React.useRef(null);

  const fetchIncidentData = async (incId) => {
    try {
      const brRes = await fetch(`http://localhost:8000/agent/blast-radius/${incId}`);
      const brData = await brRes.json();
      setBlastRadius(brData);

      const hypRes = await fetch(`http://localhost:8000/agent/hypotheses/${incId}`);
      const hypData = await hypRes.json();
      setHypothesesData(hypData);

      const confRes = await fetch(`http://localhost:8000/agent/confidence/${incId}`);
      const confData = await confRes.json();
      setConfidenceData(confData);

      const pbRes = await fetch(`http://localhost:8000/playbook/pattern`);
      const pbData = await pbRes.json();
      setPlaybookData(pbData);
    } catch (e) {
      console.error("Error fetching incident details:", e);
    }
  };

  const handleScenarioChange = async (newScenario) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setScenario(newScenario);
    setFeed([]);
    setNodes([]);
    setEdges([]);
    setApprovalStatus('idle');
    setArizeData(null);
    
    try {
      const res = await fetch('http://localhost:8000/incident/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: newScenario })
      });
      const data = await res.json();
      const incId = data.incident_id;
      setIncidentId(incId);
      await fetchIncidentData(incId);
    } catch (e) {
      console.error("Error triggering scenario:", e);
    }
  };

  const handleApprove = async () => {
    setApprovalStatus('validating');
    try {
      const res = await fetch(`http://localhost:8000/approval/approve/${incidentId}`, {
        method: 'POST'
      });
      const data = await res.json();
      console.log("Approval executed:", data);
      
      startValidationPolling();
    } catch (e) {
      console.error("Error executing approval:", e);
    }
  };

  const startValidationPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/arize/status/${incidentId}`);
        const data = await res.json();
        setArizeData(data);
        
        if (data.incident_closed) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setApprovalStatus('resolved');
          // Hit the memory learn endpoint
          await fetch(`http://localhost:8000/memory/learn/${incidentId}`, {
            method: 'POST'
          });
        }
      } catch (e) {
        console.error("Error polling Arize status:", e);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 2000);
  };

  useEffect(() => {
    handleScenarioChange('A');
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Set up EventSource for Live SRE stream
  useEffect(() => {
    if (!incidentId) return;

    const eventSource = new EventSource(`http://localhost:8000/incident/${incidentId}/stream`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFeed((prev) => [...prev, data]);
    };

    return () => {
      eventSource.close();
    };
  }, [incidentId]);

  // Animate the causal graph
  useEffect(() => {
    let timeoutId;
    let isSubscribed = true;
    
    const currentNodes = scenario === 'A' ? scenarioANodes : scenarioBNodes;
    const currentEdges = scenario === 'A' ? scenarioAEdges : scenarioBEdges;
    
    setNodes([]);
    setEdges([]);
    
    const animateGraph = async () => {
      // Small delay before starting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      for (let i = 0; i < currentNodes.length; i++) {
        if (!isSubscribed) break;
        
        setNodes(prev => [...prev, currentNodes[i]]);
        if (i > 0) {
          setEdges(prev => [...prev, currentEdges[i - 1]]);
        }
        
        // Wait 1.2s before adding the next node
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, 1200);
        });
      }
    };
    
    animateGraph();
    
    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
    };
  }, [scenario]);

  const getFeedColor = (type) => {
    switch(type) {
      case 'investigating': return 'text-blue-400';
      case 'reasoning': return 'text-yellow-400';
      case 'resolved': return 'text-green-400';
      case 'alert': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Top Bar: Blast Radius Panel */}
      <header className="bg-red-950/40 backdrop-blur-md border-b border-red-900/50 p-4 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center space-x-3">
          <AlertCircle className="text-red-500 animate-pulse w-6 h-6" />
          <h1 className="text-xl font-bold text-red-500 tracking-wide mr-4">⚠ INCIDENT DETECTED</h1>
          <select 
            value={scenario} 
            onChange={(e) => handleScenarioChange(e.target.value)} 
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-3 py-1.5 font-semibold focus:outline-none focus:border-red-500 cursor-pointer shadow-md"
          >
            <option value="A">Scenario A: Auth DB Exhaustion</option>
            <option value="B">Scenario B: Redis Timeout Cascade</option>
          </select>
        </div>
        {blastRadius && (
          <div className="flex space-x-8 text-sm">
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Affected Services</span>
              <span className="font-semibold text-red-300">
                {blastRadius.services ? blastRadius.services.join(', ') : 'auth-service, checkout-api'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Estimated Users Impacted</span>
              <span className="font-semibold text-yellow-300">{blastRadius.estimated_users.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Revenue Loss</span>
              <span className="font-semibold text-red-400">${blastRadius.revenue_loss_per_hour.toLocaleString()}/hour</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Severity</span>
              <span className="font-bold text-red-500 border border-red-500/50 px-2 rounded bg-red-950/50">{blastRadius.severity || 'P1'}</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Incident Feed */}
        <aside className="w-[350px] border-r border-slate-800/50 bg-slate-900/60 backdrop-blur-xl flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
          <div className="p-4 border-b border-slate-800/50 bg-slate-900/80">
            <h2 className="font-semibold flex items-center text-slate-300"><Activity className="w-4 h-4 mr-2 text-blue-400" /> Live Agent Feed</h2>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1 font-mono text-sm">
            {feed.length === 0 ? (
              <div className="text-slate-500 text-xs italic">Waiting for agent stream...</div>
            ) : (
              feed.map((item, idx) => (
                <div key={idx} className="flex flex-col space-y-1">
                  <span className="text-slate-500 text-xs">{item.timestamp}</span>
                  <span className={getFeedColor(item.type)}>
                    [{item.type.charAt(0).toUpperCase() + item.type.slice(1)}] {item.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Center Panel: Causal Graph */}
        <main className="flex-1 relative bg-slate-950 border-r border-slate-800">
          <ReactFlow nodes={nodes} edges={edges} fitView className="dark">
            <Background color="#334155" gap={16} />
            <Controls className="bg-slate-800 fill-slate-200 border-slate-700" />
          </ReactFlow>
        </main>

        {/* Right Panel: Hypothesis & Confidence */}
        <aside className="w-[400px] border-l border-slate-800/50 bg-slate-900/60 backdrop-blur-xl flex flex-col overflow-y-auto z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.2)]">
          {/* Confidence Panel */}
          {confidenceData && (
            <div className="p-5 border-b border-slate-800/50">
              <h2 className="font-semibold text-lg mb-3 text-slate-200">Rollback Recommendation</h2>
              <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-lg p-4 mb-5">
                <span className="text-slate-300">Confidence Score</span>
                <span className="text-3xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                  {confidenceData.total_confidence}%
                </span>
              </div>
              <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Signals Breakdown</h3>
              <ul className="space-y-3 text-sm">
                {confidenceData.signals && confidenceData.signals.map((sig, idx) => (
                  <li key={idx} className="flex justify-between items-center text-green-300">
                    <span className="truncate pr-2">+ {sig.signal}</span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-green-400">+{sig.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hypothesis Panel */}
          {hypothesesData && (
            <div className="p-5">
              <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-4">Ranked Hypotheses</h3>
              <div className="space-y-4">
                {hypothesesData.hypotheses && hypothesesData.hypotheses.map((hyp, idx) => {
                  const isSelected = hyp.selected;
                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-lg p-4 relative overflow-hidden transition-all ${
                        isSelected 
                          ? 'bg-slate-800 border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.1)]' 
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>}
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-semibold ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>{hyp.label}</span>
                        <div className="flex items-center space-x-2">
                          {isSelected && (
                            <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-1 rounded uppercase tracking-wider font-bold">Selected</span>
                          )}
                          <span className={`${isSelected ? 'text-green-400' : 'text-slate-500'} font-bold`}>{hyp.confidence}%</span>
                        </div>
                      </div>
                      {isSelected && hyp.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">{hyp.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

      </div>

      {/* Bottom Bar: Action Queue */}
      <footer className="border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-xl p-4 z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-end px-4">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">
              Playbook Triggered:{' '}
              <span className="text-blue-400 font-mono bg-blue-900/20 px-2 py-1 rounded ml-2">
                {playbookData ? playbookData.playbook_id : 'LOADING...'}
              </span>
            </div>
            <h2 className="font-semibold mb-3 text-slate-200">Proposed Actions</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              {playbookData && playbookData.steps && playbookData.steps.map((step, idx) => {
                const isApproved = approvalStatus === 'approved' || approvalStatus === 'validating' || approvalStatus === 'resolved';
                
                if (idx < 2) {
                  return (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" /> 
                      <span className="w-80">{idx + 1}. {step}</span> 
                      <span className="text-xs text-slate-500 font-mono">[DONE - agent]</span>
                    </li>
                  );
                } else if (idx === 2) {
                  return (
                    <li key={idx} className="flex items-center">
                      {isApproved ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      ) : (
                        <span className="text-blue-400 mr-3 font-bold w-4 text-center">→</span>
                      )}
                      <span className={`w-80 ${isApproved ? 'text-slate-300' : 'text-slate-100 font-medium'}`}>{idx + 1}. {step}</span> 
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        isApproved ? 'text-green-400 bg-green-900/20' : 'text-yellow-500 bg-yellow-900/20'
                      }`}>
                        {isApproved ? '[EXECUTED]' : '[PENDING APPROVAL]'}
                      </span>
                    </li>
                  );
                } else {
                  return (
                    <li key={idx} className="flex items-center">
                      <span className="text-slate-600 mr-3 font-bold w-4 text-center">○</span> 
                      <span className="w-80 text-slate-500">{idx + 1}. {step}</span> 
                      <span className="text-xs text-slate-600 font-mono">
                        {approvalStatus === 'resolved' ? '[DONE]' : '[WAITING]'}
                      </span>
                    </li>
                  );
                }
              })}
            </ul>
          </div>
          
          {approvalStatus === 'idle' && (
            <div className="flex space-x-4 mb-2">
              <button className="px-6 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center text-sm font-semibold tracking-wide cursor-pointer">
                WHY SHOULD I TRUST THIS?
              </button>
              <button 
                onClick={handleApprove}
                className="px-8 py-2.5 rounded bg-green-600 hover:bg-green-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_rgba(22,163,74,0.6)] flex items-center tracking-wide cursor-pointer"
              >
                <GitCommit className="w-5 h-5 mr-2" /> APPROVE & EXECUTE
              </button>
            </div>
          )}

          {approvalStatus === 'validating' && arizeData && (
            <div className="bg-slate-800/80 border border-yellow-500/50 rounded-lg p-4 mb-2 flex items-center space-x-6 w-[450px] shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping"></div>
              <div className="flex-1">
                <div className="text-xs text-yellow-500 uppercase tracking-wider font-semibold">Post-Fix Validation Loop</div>
                <div className="text-sm text-slate-200 mt-1 flex justify-between font-mono">
                  <span>Error Rate:</span>
                  <span className="text-yellow-400 font-bold">{arizeData.post_fix_error_rate}%</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-green-400">baseline &lt; 2.0%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Stability held: {arizeData.baseline_held_seconds}s / 60s
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-yellow-500 h-1.5 transition-all duration-500" 
                    style={{ width: `${(arizeData.baseline_held_seconds / 60) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {approvalStatus === 'resolved' && (
            <div className="bg-green-950/40 border border-green-500/50 rounded-lg p-4 mb-2 flex items-center space-x-4 w-[450px] shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <CheckCircle className="text-green-500 w-8 h-8 flex-shrink-0 animate-bounce" />
              <div>
                <div className="text-xs text-green-400 uppercase tracking-wider font-bold tracking-wider">✓ INCIDENT RESOLVED & LEARNED</div>
                <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Telemetry stabilized below baseline for 60s. Rollback successful and learned memory stored in MongoDB.
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
