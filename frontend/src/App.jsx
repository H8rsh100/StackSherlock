import React, { useState, useEffect } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AlertCircle, CheckCircle, Activity, GitCommit } from 'lucide-react';

const initialNodes = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Deployment v2.3.1' }, style: { backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' } },
  { id: '2', position: { x: 250, y: 150 }, data: { label: 'Connection Pool Misconfigured' }, style: { backgroundColor: '#7c2d12', color: '#fed7aa', border: '1px solid #9a3412', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.2)' } },
  { id: '3', position: { x: 250, y: 250 }, data: { label: 'DB Connections Exhausted' }, style: { backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #b91c1c', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)' } },
  { id: '4', position: { x: 250, y: 350 }, data: { label: 'Auth Service Latency +840ms' }, style: { backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #b91c1c', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)' } },
  { id: '5', position: { x: 250, y: 450 }, data: { label: 'Checkout API Timeouts' }, style: { backgroundColor: '#991b1b', color: '#fef2f2', border: '1px solid #dc2626', padding: '12px', borderRadius: '8px', boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#94a3b8' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#ef4444' } },
];

export default function App() {
  const [feed, setFeed] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8000/incident/INC-2024-047/stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFeed((prev) => [...prev, data]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Animate the causal graph
  useEffect(() => {
    let timeoutId;
    let isSubscribed = true;
    
    const animateGraph = async () => {
      // Small delay before starting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      for (let i = 0; i < initialNodes.length; i++) {
        if (!isSubscribed) break;
        
        setNodes(prev => [...prev, initialNodes[i]]);
        if (i > 0) {
          setEdges(prev => [...prev, initialEdges[i - 1]]);
        }
        
        // Wait 1.5s before adding the next node
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, 1500);
        });
      }
    };
    
    animateGraph();
    
    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
    };
  }, []);

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
          <h1 className="text-xl font-bold text-red-500 tracking-wide">⚠ INCIDENT DETECTED</h1>
        </div>
        <div className="flex space-x-8 text-sm">
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs uppercase tracking-wider">Affected Services</span>
            <span className="font-semibold text-red-300">auth-service, checkout-api</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs uppercase tracking-wider">Estimated Users Impacted</span>
            <span className="font-semibold text-yellow-300">14,200</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs uppercase tracking-wider">Revenue Loss</span>
            <span className="font-semibold text-red-400">$14,200/hour</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs uppercase tracking-wider">Severity</span>
            <span className="font-bold text-red-500 border border-red-500/50 px-2 rounded bg-red-950/50">P1</span>
          </div>
        </div>
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
          <div className="p-5 border-b border-slate-800/50">
            <h2 className="font-semibold text-lg mb-3 text-slate-200">Rollback Recommendation</h2>
            <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-lg p-4 mb-5">
              <span className="text-slate-300">Confidence Score</span>
              <span className="text-3xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">94%</span>
            </div>
            <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Signals Breakdown</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center text-green-300">
                <span className="truncate pr-2">+ Deployment timestamp matches spike</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-green-400">+31</span>
              </li>
              <li className="flex justify-between items-center text-green-300">
                <span className="truncate pr-2">+ Similar incident found March 14th</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-green-400">+18</span>
              </li>
              <li className="flex justify-between items-center text-green-300">
                <span className="truncate pr-2">+ Memory leak logs detected</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-green-400">+22</span>
              </li>
              <li className="flex justify-between items-center text-green-300">
                <span className="truncate pr-2">+ Failing endpoint isolated</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-green-400">+11</span>
              </li>
              <li className="flex justify-between items-center text-green-300">
                <span className="truncate pr-2">+ Code diff affects auth pooling</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-green-400">+12</span>
              </li>
            </ul>
          </div>

          {/* Hypothesis Panel */}
          <div className="p-5">
            <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-4">Ranked Hypotheses</h3>
            <div className="space-y-4">
              <div className="bg-slate-800 border border-green-500/50 rounded-lg p-4 relative overflow-hidden shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-200">Deployment memory leak</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-1 rounded uppercase tracking-wider font-bold">Selected</span>
                    <span className="text-green-400 font-bold">94%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Agent selected A because: deployment timestamp aligns within 4 minutes of error spike, code diff directly modifies connection pool limit from 100 to 10.</p>
              </div>
              
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-400">DB cluster saturation</span>
                  <span className="text-yellow-500/80 font-bold">61%</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-400">Redis timeout cascade</span>
                  <span className="text-red-400/80 font-bold">37%</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Bottom Bar: Action Queue */}
      <footer className="border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-xl p-4 z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-end px-4">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">Playbook Triggered: <span className="text-blue-400 font-mono bg-blue-900/20 px-2 py-1 rounded ml-2">AUTH_DB_CASCADE_FAILURE_v2</span></div>
            <h2 className="font-semibold mb-3 text-slate-200">Proposed Actions</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-3" /> <span className="w-64">1. Isolate deployment v2.3.1</span> <span className="text-xs text-slate-500 font-mono">[DONE - agent]</span></li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-3" /> <span className="w-64">2. Validate connection leak via logs</span> <span className="text-xs text-slate-500 font-mono">[DONE - agent]</span></li>
              <li className="flex items-center"><span className="text-blue-400 mr-3 font-bold w-4 text-center">→</span> <span className="w-64 text-slate-100 font-medium">3. Rollback auth-service to v2.3.0</span> <span className="text-xs text-yellow-500 font-mono bg-yellow-900/20 px-2 py-0.5 rounded">[PENDING APPROVAL]</span></li>
              <li className="flex items-center"><span className="text-slate-600 mr-3 font-bold w-4 text-center">○</span> <span className="w-64 text-slate-500">4. Monitor latency for 60 seconds</span> <span className="text-xs text-slate-600 font-mono">[WAITING]</span></li>
            </ul>
          </div>
          <div className="flex space-x-4 mb-2">
            <button className="px-6 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center text-sm font-semibold tracking-wide">
              WHY SHOULD I TRUST THIS?
            </button>
            <button className="px-8 py-2.5 rounded bg-green-600 hover:bg-green-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_rgba(22,163,74,0.6)] flex items-center tracking-wide">
              <GitCommit className="w-5 h-5 mr-2" /> APPROVE & EXECUTE
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
