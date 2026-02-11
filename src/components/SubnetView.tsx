import { useCallback, useContext, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SubnetCloudNode } from './nodes/SubnetCloudNode';
import { NeonEdge, NeonEdgeDirect } from './edges/NeonEdge';
import { ContextMenu, type ContextMenuItem } from './ui/ContextMenu';
import { Toolbar } from './Toolbar';
import { SubnetDialog } from './dialogs/SubnetDialog';
import { ConnectionDialog } from './dialogs/ConnectionDialog';
import { BulkConnectionDialog } from './dialogs/BulkConnectionDialog';
import { ConfirmDialog } from './dialogs/ConfirmDialog';
import { TopologyDispatchContext } from '../store/TopologyContext';
import { computeLayout, computeCircleLayout, computeGridLayout, type LayoutMode } from '../utils/autoLayout';
import { generateId } from '../utils/idGenerator';
import type { Site, Subnet } from '../data/sampleTopology';

const nodeTypes = { subnetCloud: SubnetCloudNode };
const edgeTypes = { neon: NeonEdge, neonDirect: NeonEdgeDirect };

interface SubnetViewProps {
  site: Site;
  onSelectSubnet: (subnetId: string) => void;
}

export function SubnetView({ site, onSelectSubnet }: SubnetViewProps) {
  const dispatch = useContext(TopologyDispatchContext);
  const { fitView } = useReactFlow();

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const [subnetDialog, setSubnetDialog] = useState<{ open: boolean; initial?: Subnet }>({ open: false });
  const [connDialog, setConnDialog] = useState(false);
  const [bulkConnDialog, setBulkConnDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ subnetId: string; name: string } | null>(null);
  const [posOverrides, setPosOverrides] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('dagre');

  const handleDrillDown = useCallback(
    (subnetId: string) => onSelectSubnet(subnetId),
    [onSelectSubnet]
  );

  // Layout based on selected mode
  const basePositions = useMemo(() => {
    const layoutNodes = site.subnets.map(s => ({ id: s.id, width: 200, height: 120 }));
    if (layoutNodes.length === 0) return new Map<string, { x: number; y: number }>();
    if (layoutNodes.length === 1) {
      const m = new Map<string, { x: number; y: number }>();
      m.set(layoutNodes[0].id, { x: 400, y: 300 });
      return m;
    }
    if (layoutMode === 'circle') return computeCircleLayout(
      layoutNodes,
      site.subnetConnections.map(c => ({ source: c.from, target: c.to })),
    );
    if (layoutMode === 'grid') return computeGridLayout(layoutNodes);
    return computeLayout(
      layoutNodes,
      site.subnetConnections.map(c => ({ source: c.from, target: c.to })),
      { direction: 'TB', nodeSpacing: 100, rankSpacing: 120 }
    );
  }, [site.subnets, site.subnetConnections, layoutMode]);

  const nodes: Node[] = useMemo(() =>
    site.subnets.map((subnet) => ({
      id: subnet.id,
      type: 'subnetCloud',
      position: posOverrides.get(subnet.id) || basePositions.get(subnet.id) || { x: 400, y: 300 },
      data: {
        label: subnet.name,
        cidr: subnet.cidr,
        containerCount: subnet.containers.length,
        onDrillDown: handleDrillDown,
      },
    })),
    [site.subnets, basePositions, posOverrides, handleDrillDown]
  );

  const edges: Edge[] = useMemo(() =>
    site.subnetConnections.map((conn, i) => ({
      id: `subnet-edge-${i}`,
      source: conn.from,
      target: conn.to,
      type: 'neon',
      data: { color: '#00d4ff' },
    })),
    [site.subnetConnections]
  );

  // Context menu handlers
  const onPaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    event.preventDefault();
    setCtxMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: 'Add Subnet', onClick: () => setSubnetDialog({ open: true }) },
        { label: 'Add Connection', onClick: () => setConnDialog(true) },
        { label: 'Bulk Add Connections', onClick: () => setBulkConnDialog(true) },
      ],
    });
  }, []);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    const subnet = site.subnets.find(s => s.id === node.id);
    if (!subnet) return;
    setCtxMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: 'Edit Subnet', onClick: () => setSubnetDialog({ open: true, initial: subnet }) },
        { label: 'Delete Subnet', onClick: () => setDeleteConfirm({ subnetId: subnet.id, name: subnet.name }), danger: true },
      ],
    });
  }, [site.subnets]);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    const idx = Number(edge.id.replace('subnet-edge-', ''));
    const conn = site.subnetConnections[idx];
    if (!conn) return;
    setCtxMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        {
          label: 'Delete Connection',
          danger: true,
          onClick: () => dispatch({
            type: 'DELETE_INTER_SUBNET_CONNECTION',
            payload: { siteId: site.id, from: conn.from, to: conn.to },
          }),
        },
      ],
    });
  }, [site.subnetConnections, site.id, dispatch]);

  // CRUD handlers
  const handleAddSubnet = useCallback((data: { name: string; cidr: string }) => {
    dispatch({
      type: 'ADD_SUBNET',
      payload: {
        siteId: site.id,
        subnet: {
          id: generateId(),
          name: data.name,
          cidr: data.cidr,
          containers: [],
          connections: [],
        },
      },
    });
  }, [dispatch, site.id]);

  const handleEditSubnet = useCallback((data: { name: string; cidr: string }) => {
    if (!subnetDialog.initial) return;
    dispatch({
      type: 'UPDATE_SUBNET',
      payload: {
        siteId: site.id,
        subnetId: subnetDialog.initial.id,
        updates: { name: data.name, cidr: data.cidr },
      },
    });
  }, [dispatch, site.id, subnetDialog.initial]);

  const handleDeleteSubnet = useCallback(() => {
    if (!deleteConfirm) return;
    dispatch({ type: 'DELETE_SUBNET', payload: { siteId: site.id, subnetId: deleteConfirm.subnetId } });
    setDeleteConfirm(null);
  }, [dispatch, site.id, deleteConfirm]);

  const handleAddConnection = useCallback((data: { from: string; to: string; label: string }) => {
    dispatch({
      type: 'ADD_INTER_SUBNET_CONNECTION',
      payload: {
        siteId: site.id,
        connection: { from: data.from, to: data.to, label: data.label || undefined },
      },
    });
  }, [dispatch, site.id]);

  const handleBulkConnections = useCallback((connections: { from: string; to: string }[]) => {
    for (const conn of connections) {
      dispatch({
        type: 'ADD_INTER_SUBNET_CONNECTION',
        payload: {
          siteId: site.id,
          connection: { from: conn.from, to: conn.to },
        },
      });
    }
  }, [dispatch, site.id]);

  // Interactive edge connection
  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      dispatch({
        type: 'ADD_INTER_SUBNET_CONNECTION',
        payload: {
          siteId: site.id,
          connection: { from: params.source, to: params.target },
        },
      });
    }
  }, [dispatch, site.id]);

  // Persist drag positions
  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    setPosOverrides(prev => new Map(prev).set(node.id, node.position));
  }, []);

  const handleAutoLayout = useCallback(() => {
    setPosOverrides(new Map());
    setTimeout(() => fitView({ padding: 0.4 }), 50);
  }, [fitView]);

  const connectionNodes = useMemo(
    () => site.subnets.map(s => ({ id: s.id, name: s.name })),
    [site.subnets]
  );

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
        nodesConnectable={true}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        connectionLineStyle={{ stroke: '#00d4ff', strokeWidth: 1.5, opacity: 0.6 }}
      >
        <Background
          color="rgba(0, 212, 255, 0.04)"
          gap={40}
          size={1}
        />
        <Controls showInteractive={false} />
      </ReactFlow>

      <Toolbar
        onAdd={() => setSubnetDialog({ open: true })}
        addLabel="Subnet"
        onAutoLayout={handleAutoLayout}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
      />

      <div className="scale-label">Subnet Overview — {site.name}</div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxMenu.items}
          onClose={() => setCtxMenu(null)}
        />
      )}

      <SubnetDialog
        open={subnetDialog.open}
        onClose={() => setSubnetDialog({ open: false })}
        onSubmit={subnetDialog.initial ? handleEditSubnet : handleAddSubnet}
        initial={subnetDialog.initial}
      />

      <ConnectionDialog
        open={connDialog}
        onClose={() => setConnDialog(false)}
        onSubmit={handleAddConnection}
        availableNodes={connectionNodes}
      />

      <BulkConnectionDialog
        open={bulkConnDialog}
        onClose={() => setBulkConnDialog(false)}
        onSubmit={handleBulkConnections}
        availableNodes={connectionNodes}
        existingConnections={site.subnetConnections}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Subnet"
        message={`Delete "${deleteConfirm?.name}"? All containers within will be removed.`}
        onConfirm={handleDeleteSubnet}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
