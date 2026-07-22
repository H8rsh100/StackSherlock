import React, { useState, useEffect, useRef } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';
import { AlertCircle, CheckCircle, Activity, GitCommit, ShieldAlert, Cpu, Terminal, Layers } from 'lucide-react';

const scenarioANodes = [
  { id: '1', position: { x: 260, y: 40 }, data: { label: '🚀 Deployment v2.3.1 (GitLab MR #402)' }, style: { backgroundColor: '#0f172a', color: '#e2e8f0', border: '1px solid #38bdf8', padding: '14px 18px', borderRadius: '12px', boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)', fontWeight: '600', fontSize: '13px' } },
  { id: '2', position: { x: 260, y: 140 }, data: { label: '⚙️ Connection Pool Misconfigured' }, style: { backgroundColor: '#451a03', color: '#fed7aa', border: '1px solid #f97316', padding: '14px 18px', borderRadius: '12px', boxShadow: '0 0 22px rgba(249, 115, 22, 0.35)', fontWeight: '600', fontSize: '13px' } },
  { id: '3', position: { x: 260, y: 240 }, data: { label: '🔥 DB Connections Exhausted (Max 100/100)' }, style: { backgroundColor: '#450a0a', color: '#fca5a5', border: '1px solid #ef4444', padding: '14px 18px', borderRadius: '12px', boxShadow: '0 0 25px rgba(239, 68, 68, 0.45)', fontWeight: '700', fontSize: '13px' } },
  { id: '4', position: { x: 260, y: 340 }, data: { label: '⚠️ Auth Service Latency Spiked +840ms' }, style: { backgroundColor: '#450a0a', color: '#fca5a5', border: '1px solid #f43f5e', padding: '14px 18px', borderRadius: '12px', boxShadow: '0 0 25px rgba(244, 63, 94, 0.45)', fontWeight: '600', fontSize: '13px' } },
  { id: '5', position: { x: 260, y: 440 }, data: { label: '🚨 Checkout API 504 Gateway Timeouts' }, style: { backgroundColor: '#7f1d1d', color: '#ffffff', border: '2px solid #dc2626', padding: '16px 20px', borderRadius: '14px', boxShadow: '0 0 35px rgba(220, 38, 38, 0.75)', fontWeight: '800', fontSize: '14px' } },
];

const scenarioAEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#f97316', strokeWidth: 2.5 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#ef4444', strokeWidth: 2.5 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#dc2626', strokeWidth: 3 } },
];

const scenarioBNodes = [
  { id: '1', position: { x: 260, y: 40 }, data: { label: '🚀 Deployment v3.0.0 (GitLab MR #512)' }, style: { backgroundColor: '#0f172a', color: '#e2e8f0', border: '1px solid #38bdf8', padding: '14px 18px', borderRadius: '12px', boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)', fontWeight: '600', fontSize: '13px' } },
  { id: '2', position: { x: 260, y: 140 }, data: { label: '⚡ Redis Cache Miss Rate 80%' }, style: { backgroundColor: '#451a03', color: '#fed7aa', border: '1px solid #f97316', padding: '14px 18px', borderRadius: '12px', boxShadow: '0 0 22px rgba(249, 115, 22, 0.35)', fontWeight: '600', fontSize: '13px' } },
  { id: '3', position: { x: 260, y: 240 }, data: { label: '💥 RedisTimeoutError (Cluster Unresponsive)' }, style: { backgroundColor: '#450a0a', color: '#fca5a5', border: '1px solid #ef4444', padding: '14px 18px', borderRadius: '12px', boxShadow: '0 0 25px rgba(239, 68, 68, 0.45)', fontWeight: '700', fontSize: '13px' } },
  { id: '4', position: { x: 260, y: 340 }, data: { label: '📈 Fallback DB CPU Saturation 100%' }, style: { backgroundColor: '#450a0a', color: '#fca5a5', border: '1px solid #f43f5e', padding: '14px 18px', borderRadius: '12px', boxShadow: '0 0 25px rgba(244, 63, 94, 0.45)', fontWeight: '600', fontSize: '13px' } },
  { id: '5', position: { x: 260, y: 440 }, data: { label: '🚨 Checkout API 504 Gateway Timeouts' }, style: { backgroundColor: '#7f1d1d', color: '#ffffff', border: '2px solid #dc2626', padding: '16px 20px', borderRadius: '14px', boxShadow: '0 0 35px rgba(220, 38, 38, 0.75)', fontWeight: '800', fontSize: '14px' } },
];

const scenarioBEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#f97316', strokeWidth: 2.5 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#ef4444', strokeWidth: 2.5 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#dc2626', strokeWidth: 3 } },
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
  const intervalRef = useRef(null);
  const feedEndRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [activeTab, setActiveTab] = useState('diff');

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

      const auditRes = await fetch(`http://localhost:8000/agent/audit/${incId}`);
      const auditDataVal = await auditRes.json();
      setAuditData(auditDataVal);
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
    setIsModalOpen(false);
    setAuditData(null);
    setActiveTab('diff');
    
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

  useEffect(() => {
    let timeoutId;
    let isSubscribed = true;
    
    const currentNodes = scenario === 'A' ? scenarioANodes : scenarioBNodes;
    const currentEdges = scenario === 'A' ? scenarioAEdges : scenarioBEdges;
    
    setNodes([]);
    setEdges([]);
    
    const animateGraph = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      for (let i = 0; i < currentNodes.length; i++) {
        if (!isSubscribed) break;
        
        setNodes(prev => [...prev, currentNodes[i]]);
        if (i > 0) {
          setEdges(prev => [...prev, currentEdges[i - 1]]);
        }
        
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
      case 'investigating': return 'text-sky-400 border-sky-500/30 bg-sky-950/40';
      case 'reasoning': return 'text-amber-400 border-amber-500/30 bg-amber-950/40';
      case 'resolved': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
      case 'alert': return 'text-rose-400 border-rose-500/30 bg-rose-950/40';
      default: return 'text-slate-400 border-slate-700 bg-slate-800/40';
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Top Command Header with Telemetry */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-red-900/40 px-6 py-3.5 flex items-center justify-between z-20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-red-950/80 border border-red-500/40 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse-glow-red">
            <ShieldAlert className="text-red-500 w-5 h-5 animate-pulse" />
            <span className="text-xs font-extrabold text-red-400 tracking-wider uppercase">P1 CRITICAL INCIDENT</span>
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Scenario:</span>
            <select 
              value={scenario} 
              onChange={(e) => handleScenarioChange(e.target.value)} 
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer shadow-inner transition-all hover:border-slate-600"
            >
              <option value="A">Scenario A: Auth DB Exhaustion</option>
              <option value="B">Scenario B: Redis Timeout Cascade</option>
            </select>
          </div>
        </div>

        {blastRadius && (
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex flex-col bg-slate-950/60 border border-slate-800/80 px-3.5 py-1.5 rounded-lg">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Affected Services</span>
              <span className="font-semibold text-rose-300 font-mono">
                {blastRadius.services ? blastRadius.services.join(', ') : 'auth-service, checkout-api'}
              </span>
            </div>
            <div className="flex flex-col bg-slate-950/60 border border-slate-800/80 px-3.5 py-1.5 rounded-lg">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Impacted Users</span>
              <span className="font-bold text-amber-400 font-mono">{blastRadius.estimated_users.toLocaleString()}</span>
            </div>
            <div className="flex flex-col bg-slate-950/60 border border-slate-800/80 px-3.5 py-1.5 rounded-lg">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Revenue Loss</span>
              <span className="font-bold text-rose-400 font-mono">${blastRadius.revenue_loss_per_hour.toLocaleString()}/hr</span>
            </div>
            <div className="flex items-center space-x-2 bg-red-900/30 border border-red-700/50 px-3 py-2 rounded-lg">
              <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider">SEV</span>
              <span className="font-extrabold text-red-400 text-sm font-mono">{blastRadius.severity || 'P1'}</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Grid Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Live SRE Agent Feed */}
        <aside className="w-[360px] border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
          <div className="px-4 py-3.5 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
            <h2 className="font-bold flex items-center text-slate-200 text-xs tracking-wider uppercase">
              <Terminal className="w-4 h-4 mr-2 text-cyan-400" /> Live Telemetry Feed
            </h2>
            <span className="flex items-center text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-700/40 px-2 py-0.5 rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-1.5"></span> LIVE
            </span>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto flex-1 font-mono text-xs terminal-scanline">
            {feed.length === 0 ? (
              <div className="text-slate-500 text-xs italic flex items-center space-x-2">
                <Cpu className="w-4 h-4 animate-spin text-cyan-500" />
                <span>Connecting to Gemini agent stream...</span>
              </div>
            ) : (
              feed.map((item, idx) => (
                <div key={idx} className="flex flex-col space-y-1.5 bg-slate-950/70 border border-slate-800/60 p-2.5 rounded-lg animate-fade-in-up">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{item.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded border uppercase text-[9px] font-bold ${getFeedColor(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans text-xs">{item.message}</p>
                </div>
              ))
            )}
            <div ref={feedEndRef} />
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
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center text-sm font-semibold tracking-wide cursor-pointer"
              >
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

      {/* Modal Overlay */}
      {isModalOpen && auditData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center space-x-2.5">
                <span className="p-1.5 rounded bg-blue-900/30 text-blue-400">
                  <GitCommit className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-lg text-slate-100">Why should I trust this recommendation?</h3>
                  <p className="text-xs text-slate-400">Audited parameters for Incident {incidentId}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40">
              <button 
                onClick={() => setActiveTab('diff')}
                className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  activeTab === 'diff' 
                    ? 'border-blue-500 text-blue-400 bg-slate-800/30' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Git Diff
              </button>
              <button 
                onClick={() => setActiveTab('risk')}
                className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  activeTab === 'risk' 
                    ? 'border-red-500 text-red-400 bg-slate-800/30' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Risk Assessment
              </button>
              <button 
                onClick={() => setActiveTab('precedents')}
                className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  activeTab === 'precedents' 
                    ? 'border-purple-500 text-purple-400 bg-slate-800/30' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Historical Precedents
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-900/20 text-sm">
              
              {/* Tab 1: Git Diff */}
              {activeTab === 'diff' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400 font-medium">
                    Suspicious code changes identified in deployment commit:
                  </div>
                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[40vh]">
                    <code>{auditData.git_diff}</code>
                  </pre>
                </div>
              )}

              {/* Tab 2: Risk Assessment */}
              {activeTab === 'risk' && auditData.claude_risk_assessment && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Severity:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      auditData.claude_risk_assessment.risk_level === 'CRITICAL'
                        ? 'bg-red-950 text-red-400 border border-red-500/30'
                        : 'bg-yellow-950 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {auditData.claude_risk_assessment.risk_level}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800/50 rounded-lg mb-3">
                    <div className="font-semibold text-slate-200 mb-2">Claude SRE Summary</div>
                    <p className="text-slate-300 text-xs leading-relaxed">{auditData.claude_risk_assessment.summary}</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800/50 rounded-lg">
                    <div className="font-semibold text-slate-200 mb-2">Impact Analysis</div>
                    <p className="text-slate-300 text-xs leading-relaxed">{auditData.claude_risk_assessment.analysis}</p>
                  </div>
                </div>
              )}

              {/* Tab 3: Historical Precedents */}
              {activeTab === 'precedents' && auditData.mongodb_precedents && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400 font-medium mb-2">
                    MongoDB matched historical incident logs:
                  </div>
                  {auditData.mongodb_precedents.map((prec, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="font-semibold text-purple-400 font-mono">{prec.incident_id}</span>
                        <span className="text-xs text-slate-500">{prec.date}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                        <div>
                          <span className="text-slate-500 block">Scenario Type:</span>
                          <span className="text-slate-300 font-semibold">{prec.scenario}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Resolution Action:</span>
                          <span className="text-slate-300 font-semibold">{prec.resolution}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors border border-slate-700"
              >
                Close Audit Report
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
