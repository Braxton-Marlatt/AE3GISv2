import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DeviceNode } from './nodes/DeviceNode';
import { NeonEdge } from './edges/NeonEdge';
import type { Subnet, Container, ContainerType } from '../data/sampleTopology';

const nodeTypes = { device: DeviceNode };
const edgeTypes = { neon: NeonEdge };

const typeOrder: ContainerType[] = [
  'router',
  'firewall',
  'switch',
  'web-server',
  'file-server',
  'plc',
  'workstation',
];

const typeColors: Record<ContainerType, string> = {
  'router': '#ff00ff',
  'firewall': '#ff3344',
  'switch': '#ffaa00',
  'web-server': '#00ff9f',
  'file-server': '#00d4ff',
  'plc': '#ffaa00',
  'workstation': '#4466ff',
};

interface LanViewProps {
  subnet: Subnet;
  onSelectContainer: (container: Container) => void;
}

function layoutContainers(containers: Container[]) {
  // Group by type, then lay out in tiers
  const tiers: Map<ContainerType, Container[]> = new Map();
  for (const c of containers) {
    const list = tiers.get(c.type) || [];
    list.push(c);
    tiers.set(c.type, list);
  }

  const positions: Map<string, { x: number; y: number }> = new Map();
  let tierY = 0;
  const tierSpacing = 120;
  const nodeSpacing = 140;

  for (const type of typeOrder) {
    const group = tiers.get(type);
    if (!group || group.length === 0) continue;

    const totalWidth = (group.length - 1) * nodeSpacing;
    const startX = -totalWidth / 2;

    for (let i = 0; i < group.length; i++) {
      positions.set(group[i].id, {
        x: startX + i * nodeSpacing + 300,
        y: tierY + 50,
      });
    }

    tierY += tierSpacing;
  }

  return positions;
}

export function LanView({ subnet, onSelectContainer }: LanViewProps) {
  const handleSelect = useCallback(
    (container: Container) => onSelectContainer(container),
    [onSelectContainer]
  );

  const positions = useMemo(
    () => layoutContainers(subnet.containers),
    [subnet.containers]
  );

  const nodes: Node[] = useMemo(
    () =>
      subnet.containers.map((container) => ({
        id: container.id,
        type: 'device',
        position: positions.get(container.id) || { x: 0, y: 0 },
        data: {
          container,
          onSelect: handleSelect,
        },
      })),
    [subnet.containers, positions, handleSelect]
  );

  const edges: Edge[] = useMemo(
    () =>
      subnet.connections.map((conn, i) => {
        const sourceContainer = subnet.containers.find(
          (c) => c.id === conn.from
        );
        const color = sourceContainer
          ? typeColors[sourceContainer.type]
          : '#00ff9f';
        return {
          id: `lan-edge-${i}`,
          source: conn.from,
          target: conn.to,
          type: 'neon',
          data: { color },
        };
      }),
    [subnet.connections, subnet.containers]
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
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Background
          color="rgba(0, 255, 159, 0.03)"
          gap={30}
          size={1}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
      <div className="scale-label">
        LAN Detail — {subnet.name} ({subnet.cidr})
      </div>
    </div>
  );
}
