import { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { sampleTopology, type Container } from './data/sampleTopology';
import { GeographicView } from './components/GeographicView';
import { SubnetView } from './components/SubnetView';
import { LanView } from './components/LanView';
import { Breadcrumb } from './components/Breadcrumb';
import { NodeInfoPanel } from './components/NodeInfoPanel';
import { TerminalOverlay } from './components/TerminalOverlay';

type ViewScale = 'geographic' | 'subnet' | 'lan';

interface NavigationState {
  scale: ViewScale;
  siteId: string | null;
  subnetId: string | null;
}

function App() {
  const [nav, setNav] = useState<NavigationState>({
    scale: 'geographic',
    siteId: null,
    subnetId: null,
  });

  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [terminalContainer, setTerminalContainer] = useState<Container | null>(null);

  const topology = sampleTopology;

  // Navigation handlers
  const goToGeographic = useCallback(() => {
    setNav({ scale: 'geographic', siteId: null, subnetId: null });
    setSelectedContainer(null);
  }, []);

  const goToSite = useCallback((siteId: string) => {
    setNav({ scale: 'subnet', siteId, subnetId: null });
    setSelectedContainer(null);
  }, []);

  const goToSubnet = useCallback(
    (subnetId: string) => {
      setNav((prev) => ({ ...prev, scale: 'lan', subnetId }));
      setSelectedContainer(null);
    },
    []
  );

  // Get current data for the active view
  const currentSite = useMemo(
    () => topology.sites.find((s) => s.id === nav.siteId) ?? null,
    [topology.sites, nav.siteId]
  );

  const currentSubnet = useMemo(
    () => currentSite?.subnets.find((s) => s.id === nav.subnetId) ?? null,
    [currentSite, nav.subnetId]
  );

  // Stats
  const totalContainers = useMemo(
    () =>
      topology.sites.reduce(
        (acc, site) =>
          acc + site.subnets.reduce((a, s) => a + s.containers.length, 0),
        0
      ),
    [topology.sites]
  );

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items: { label: string; onClick: () => void }[] = [];
    if (nav.scale !== 'geographic') {
      items.push({ label: 'Network', onClick: goToGeographic });
    }
    if (nav.scale === 'lan' && currentSite) {
      items.push({
        label: currentSite.name,
        onClick: () => goToSite(currentSite.id),
      });
    }
    return items;
  }, [nav.scale, currentSite, goToGeographic, goToSite]);

  const currentLabel = useMemo(() => {
    switch (nav.scale) {
      case 'geographic':
        return 'Network Overview';
      case 'subnet':
        return currentSite?.name ?? 'Site';
      case 'lan':
        return currentSubnet
          ? `${currentSubnet.name} (${currentSubnet.cidr})`
          : 'LAN';
    }
  }, [nav.scale, currentSite, currentSubnet]);

  return (
    <div className="app-container">
      {/* Scanline overlay for CRT effect */}
      <div className="scanline-overlay" />

      {/* Header */}
      <header className="header-bar">
        <div className="header-title">AE3GIS</div>
        <div className="header-stats">
          <div className="header-stat">
            <span className="dot" />
            <span>{topology.sites.length} sites</span>
          </div>
          <div className="header-stat">
            <span className="dot" />
            <span>{totalContainers} containers</span>
          </div>
          <div className="header-stat">
            <span className="dot" />
            <span>System Online</span>
          </div>
        </div>
      </header>

      {/* Breadcrumb navigation */}
      <Breadcrumb items={breadcrumbItems} current={currentLabel} />

      {/* Main canvas */}
      <div className="topology-canvas">
        <ReactFlowProvider>
          {nav.scale === 'geographic' && (
            <GeographicView
              topology={topology}
              onSelectSite={goToSite}
            />
          )}
        </ReactFlowProvider>

        <ReactFlowProvider>
          {nav.scale === 'subnet' && currentSite && (
            <SubnetView
              site={currentSite}
              onSelectSubnet={goToSubnet}
            />
          )}
        </ReactFlowProvider>

        <ReactFlowProvider>
          {nav.scale === 'lan' && currentSubnet && (
            <LanView
              subnet={currentSubnet}
              onSelectContainer={setSelectedContainer}
            />
          )}
        </ReactFlowProvider>

        {/* Info panel */}
        <NodeInfoPanel
          container={selectedContainer}
          onClose={() => setSelectedContainer(null)}
          onOpenTerminal={(c) => setTerminalContainer(c)}
        />
      </div>

      {/* Terminal overlay */}
      {terminalContainer && (
        <TerminalOverlay
          container={terminalContainer}
          onClose={() => setTerminalContainer(null)}
        />
      )}
    </div>
  );
}

export default App;
