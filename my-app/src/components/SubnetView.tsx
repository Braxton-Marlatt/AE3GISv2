import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SubnetCloudNode } from './nodes/SubnetCloudNode';
import { NeonEdge } from './edges/NeonEdge';
import type { Site } from '../data/sampleTopology';

const nodeTypes = { subnetCloud: SubnetCloudNode };
const edgeTypes = { neon: NeonEdge };

interface SubnetViewProps {
  site: Site;
  onSelectSubnet: (subnetId: string) => void;
}

export function SubnetView({ site, onSelectSubnet }: SubnetViewProps) {
  const handleDrillDown = useCallback(
    (subnetId: string) => onSelectSubnet(subnetId),
    [onSelectSubnet]
  );

  const nodes: Node[] = useMemo(() => {
    const count = site.subnets.length;
    const radiusX = 200;
    const radiusY = 140;
    const centerX = 400;
    const centerY = 300;

    return site.subnets.map((subnet, i) => {
      const angle = ((2 * Math.PI) / count) * i - Math.PI / 2;
      return {
        id: subnet.id,
        type: 'subnetCloud',
        position: {
          x: centerX + radiusX * Math.cos(angle) * (count > 1 ? 1 : 0),
          y: centerY + radiusY * Math.sin(angle) * (count > 1 ? 1 : 0),
        },
        data: {
          label: subnet.name,
          cidr: subnet.cidr,
          containerCount: subnet.containers.length,
          onDrillDown: handleDrillDown,
        },
      };
    });
  }, [site.subnets, handleDrillDown]);

  const edges: Edge[] = useMemo(() => {
    const edgeList: Edge[] = [];
    // Connect subnets in a mesh if there are multiple
    for (let i = 0; i < site.subnets.length; i++) {
      for (let j = i + 1; j < site.subnets.length; j++) {
        edgeList.push({
          id: `subnet-edge-${i}-${j}`,
          source: site.subnets[i].id,
          target: site.subnets[j].id,
          type: 'neon',
          data: { color: '#00d4ff' },
        });
      }
    }
    return edgeList;
  }, [site.subnets]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Background
          color="rgba(0, 212, 255, 0.04)"
          gap={40}
          size={1}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
      <div className="scale-label">Subnet Overview — {site.name}</div>
    </div>
  );
}
