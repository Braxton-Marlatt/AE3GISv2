import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SiteNode } from './nodes/SiteNode';
import { NeonEdgeStraight } from './edges/NeonEdge';
import type { TopologyData } from '../data/sampleTopology';

const nodeTypes = { site: SiteNode };
const edgeTypes = { neonStraight: NeonEdgeStraight };

interface GeographicViewProps {
  topology: TopologyData;
  onSelectSite: (siteId: string) => void;
}

export function GeographicView({ topology, onSelectSite }: GeographicViewProps) {
  const handleDrillDown = useCallback(
    (siteId: string) => onSelectSite(siteId),
    [onSelectSite]
  );

  const nodes: Node[] = useMemo(
    () =>
      topology.sites.map((site) => ({
        id: site.id,
        type: 'site',
        position: { x: site.position.x * 3, y: site.position.y * 2.5 },
        data: {
          label: site.name,
          location: site.location,
          subnetCount: site.subnets.length,
          containerCount: site.subnets.reduce(
            (acc, s) => acc + s.containers.length,
            0
          ),
          onDrillDown: handleDrillDown,
        },
      })),
    [topology.sites, handleDrillDown]
  );

  const edges: Edge[] = useMemo(
    () =>
      topology.siteConnections.map((conn, i) => ({
        id: `site-edge-${i}`,
        source: conn.from,
        target: conn.to,
        type: 'neonStraight',
        label: conn.label,
        data: { color: '#00ff9f' },
      })),
    [topology.siteConnections]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Background
          color="rgba(0, 255, 159, 0.06)"
          gap={40}
          size={1}
        />
        <Controls
          showInteractive={false}
          style={{ bottom: 20, right: 20 }}
        />
        <MiniMap
          nodeColor="#00ff9f"
          maskColor="rgba(10, 10, 15, 0.8)"
          style={{ bottom: 20, left: 20, width: 140, height: 100 }}
        />
      </ReactFlow>
      <div className="scale-label">Geographic Overview</div>
    </div>
  );
}
