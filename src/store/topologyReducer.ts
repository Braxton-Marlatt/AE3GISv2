import type { TopologyData, Site, Subnet, Container, Connection } from '../data/sampleTopology';

export interface TopologyState {
  topology: TopologyData;
}

export type TopologyAction =
  // Sites
  | { type: 'ADD_SITE'; payload: Site }
  | { type: 'UPDATE_SITE'; payload: { siteId: string; updates: Partial<Omit<Site, 'id' | 'subnets' | 'subnetConnections'>> } }
  | { type: 'DELETE_SITE'; payload: { siteId: string } }
  // Subnets
  | { type: 'ADD_SUBNET'; payload: { siteId: string; subnet: Subnet } }
  | { type: 'UPDATE_SUBNET'; payload: { siteId: string; subnetId: string; updates: Partial<Omit<Subnet, 'id' | 'containers' | 'connections'>> } }
  | { type: 'DELETE_SUBNET'; payload: { siteId: string; subnetId: string } }
  // Containers
  | { type: 'ADD_CONTAINER'; payload: { siteId: string; subnetId: string; container: Container } }
  | { type: 'UPDATE_CONTAINER'; payload: { siteId: string; subnetId: string; containerId: string; updates: Partial<Omit<Container, 'id'>> } }
  | { type: 'DELETE_CONTAINER'; payload: { siteId: string; subnetId: string; containerId: string } }
  // Site connections
  | { type: 'ADD_SITE_CONNECTION'; payload: Connection }
  | { type: 'DELETE_SITE_CONNECTION'; payload: { from: string; to: string } }
  // Inter-subnet connections (subnet-to-subnet within a site)
  | { type: 'ADD_INTER_SUBNET_CONNECTION'; payload: { siteId: string; connection: Connection } }
  | { type: 'DELETE_INTER_SUBNET_CONNECTION'; payload: { siteId: string; from: string; to: string } }
  // Subnet connections (container-to-container within a subnet)
  | { type: 'ADD_SUBNET_CONNECTION'; payload: { siteId: string; subnetId: string; connection: Connection } }
  | { type: 'DELETE_SUBNET_CONNECTION'; payload: { siteId: string; subnetId: string; from: string; to: string } }
  // Bulk
  | { type: 'LOAD_TOPOLOGY'; payload: TopologyData };

export function topologyReducer(draft: TopologyState, action: TopologyAction) {
  switch (action.type) {
    // ── Sites ──
    case 'ADD_SITE':
      draft.topology.sites.push(action.payload);
      break;

    case 'UPDATE_SITE': {
      const site = draft.topology.sites.find(s => s.id === action.payload.siteId);
      if (site) Object.assign(site, action.payload.updates);
      break;
    }

    case 'DELETE_SITE': {
      const { siteId } = action.payload;
      draft.topology.sites = draft.topology.sites.filter(s => s.id !== siteId);
      draft.topology.siteConnections = draft.topology.siteConnections.filter(
        c => c.from !== siteId && c.to !== siteId
      );
      break;
    }

    // ── Subnets ──
    case 'ADD_SUBNET': {
      const site = draft.topology.sites.find(s => s.id === action.payload.siteId);
      if (site) site.subnets.push(action.payload.subnet);
      break;
    }

    case 'UPDATE_SUBNET': {
      const site = draft.topology.sites.find(s => s.id === action.payload.siteId);
      const subnet = site?.subnets.find(s => s.id === action.payload.subnetId);
      if (subnet) Object.assign(subnet, action.payload.updates);
      break;
    }

    case 'DELETE_SUBNET': {
      const site = draft.topology.sites.find(s => s.id === action.payload.siteId);
      if (site) {
        const subnetId = action.payload.subnetId;
        site.subnets = site.subnets.filter(s => s.id !== subnetId);
        site.subnetConnections = site.subnetConnections.filter(
          c => c.from !== subnetId && c.to !== subnetId
        );
      }
      break;
    }

    // ── Containers ──
    case 'ADD_CONTAINER': {
      const site = draft.topology.sites.find(s => s.id === action.payload.siteId);
      const subnet = site?.subnets.find(s => s.id === action.payload.subnetId);
      if (subnet) subnet.containers.push(action.payload.container);
      break;
    }

    case 'UPDATE_CONTAINER': {
      const site = draft.topology.sites.find(s => s.id === action.payload.siteId);
      const subnet = site?.subnets.find(s => s.id === action.payload.subnetId);
      const container = subnet?.containers.find(c => c.id === action.payload.containerId);
      if (container) Object.assign(container, action.payload.updates);
      break;
    }

    case 'DELETE_CONTAINER': {
      const { siteId, subnetId, containerId } = action.payload;
      const site = draft.topology.sites.find(s => s.id === siteId);
      const subnet = site?.subnets.find(s => s.id === subnetId);
      if (subnet) {
        subnet.containers = subnet.containers.filter(c => c.id !== containerId);
        subnet.connections = subnet.connections.filter(
          c => c.from !== containerId && c.to !== containerId
        );
      }
      break;
    }

    // ── Site Connections ──
    case 'ADD_SITE_CONNECTION':
      draft.topology.siteConnections.push(action.payload);
      break;

    case 'DELETE_SITE_CONNECTION':
      draft.topology.siteConnections = draft.topology.siteConnections.filter(
        c => !(c.from === action.payload.from && c.to === action.payload.to) &&
             !(c.from === action.payload.to && c.to === action.payload.from)
      );
      break;

    // ── Inter-Subnet Connections ──
    case 'ADD_INTER_SUBNET_CONNECTION': {
      const site = draft.topology.sites.find(s => s.id === action.payload.siteId);
      if (site) site.subnetConnections.push(action.payload.connection);
      break;
    }

    case 'DELETE_INTER_SUBNET_CONNECTION': {
      const site = draft.topology.sites.find(s => s.id === action.payload.siteId);
      if (site) {
        site.subnetConnections = site.subnetConnections.filter(
          c => !(c.from === action.payload.from && c.to === action.payload.to) &&
               !(c.from === action.payload.to && c.to === action.payload.from)
        );
      }
      break;
    }

    // ── Subnet Connections ──
    case 'ADD_SUBNET_CONNECTION': {
      const site = draft.topology.sites.find(s => s.id === action.payload.siteId);
      const subnet = site?.subnets.find(s => s.id === action.payload.subnetId);
      if (subnet) subnet.connections.push(action.payload.connection);
      break;
    }

    case 'DELETE_SUBNET_CONNECTION': {
      const site = draft.topology.sites.find(s => s.id === action.payload.siteId);
      const subnet = site?.subnets.find(s => s.id === action.payload.subnetId);
      if (subnet) {
        subnet.connections = subnet.connections.filter(
          c => !(c.from === action.payload.from && c.to === action.payload.to) &&
               !(c.from === action.payload.to && c.to === action.payload.from)
        );
      }
      break;
    }

    // ── Bulk ──
    case 'LOAD_TOPOLOGY':
      draft.topology = action.payload;
      break;
  }
}
