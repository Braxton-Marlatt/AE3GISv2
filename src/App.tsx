import { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useImmerReducer } from 'use-immer';
import { sampleTopology, type Container } from './data/sampleTopology';
import { topologyReducer, type TopologyState } from './store/topologyReducer';
import { TopologyDispatchContext } from './store/TopologyContext';
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

const initialState: TopologyState = { topology: sampleTopology };

function App() {
  const [state, dispatch] = useImmerReducer(topologyReducer, initialState);
  const { topology } = state;

  const [nav, setNav] = useState<NavigationState>({
    scale: 'geographic',
    siteId: null,
    subnetId: null,
  });

  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [terminalContainer, setTerminalContainer] = useState<Container | null>(null);

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

  // Navigation guards: derive effective nav (corrects if entities were deleted)
  const effectiveNav = useMemo<NavigationState>(() => {
    if (nav.siteId && !topology.sites.find(s => s.id === nav.siteId)) {
      return { scale: 'geographic', siteId: null, subnetId: null };
    }
    const site = topology.sites.find(s => s.id === nav.siteId);
    if (nav.subnetId && site && !site.subnets.find(s => s.id === nav.subnetId)) {
      return { ...nav, scale: 'subnet', subnetId: null };
    }
    return nav;
  }, [nav, topology.sites]);

  // Get current data for the active view
  const currentSite = useMemo(
    () => topology.sites.find((s) => s.id === effectiveNav.siteId) ?? null,
    [topology.sites, effectiveNav.siteId]
  );

  const currentSubnet = useMemo(
    () => currentSite?.subnets.find((s) => s.id === effectiveNav.subnetId) ?? null,
    [currentSite, effectiveNav.subnetId]
  );

  // Clear selected container when not on LAN view
  const activeContainer = useMemo(
    () => (effectiveNav.scale === 'lan' ? selectedContainer : null),
    [effectiveNav.scale, selectedContainer]
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
    if (effectiveNav.scale !== 'geographic') {
      items.push({ label: 'Network', onClick: goToGeographic });
    }
    if (effectiveNav.scale === 'lan' && currentSite) {
      items.push({
        label: currentSite.name,
        onClick: () => goToSite(currentSite.id),
      });
    }
    return items;
  }, [effectiveNav.scale, currentSite, goToGeographic, goToSite]);

  const currentLabel = useMemo(() => {
    switch (effectiveNav.scale) {
      case 'geographic':
        return 'Network Overview';
      case 'subnet':
        return currentSite?.name ?? 'Site';
      case 'lan':
        return currentSubnet
          ? `${currentSubnet.name} (${currentSubnet.cidr})`
          : 'LAN';
    }
  }, [effectiveNav.scale, currentSite, currentSubnet]);

  return (
    <TopologyDispatchContext.Provider value={dispatch}>
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
            {effectiveNav.scale === 'geographic' && (
              <GeographicView
                topology={topology}
                onSelectSite={goToSite}
              />
            )}
          </ReactFlowProvider>

          <ReactFlowProvider>
            {effectiveNav.scale === 'subnet' && currentSite && (
              <SubnetView
                site={currentSite}
                onSelectSubnet={goToSubnet}
              />
            )}
          </ReactFlowProvider>

          <ReactFlowProvider>
            {effectiveNav.scale === 'lan' && currentSubnet && currentSite && (
              <LanView
                subnet={currentSubnet}
                siteId={currentSite.id}
                onSelectContainer={setSelectedContainer}
              />
            )}
          </ReactFlowProvider>

          {/* Info panel */}
          <NodeInfoPanel
            container={activeContainer}
            onClose={() => setSelectedContainer(null)}
            onOpenTerminal={(c) => setTerminalContainer(c)}
            siteId={effectiveNav.siteId}
            subnetId={effectiveNav.subnetId}
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
    </TopologyDispatchContext.Provider>
  );
}

export default App;
