import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SCENARIOS } from '../data/scenarios';

export default function CausalGraph({ scenario, nodes, edges }) {
  const meta = SCENARIOS[scenario];

  return (
    <main className="graph-panel">
      <div className="graph-overlay">
        <p className="graph-kicker">Causal chain</p>
        <h2>{meta?.label}</h2>
        <p>{meta?.subtitle}</p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        className="graph-canvas"
      >
        <Background color="#1e293b" gap={18} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => n.style?.border?.match(/#[0-9a-fA-F]{3,8}/)?.[0] || '#334155'}
          maskColor="rgba(2, 6, 23, 0.75)"
          className="graph-minimap"
        />
      </ReactFlow>
    </main>
  );
}
