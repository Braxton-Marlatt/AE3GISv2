// ── Types ──────────────────────────────────────────────────────────

export type ContainerType =
  | 'web-server'
  | 'file-server'
  | 'plc'
  | 'firewall'
  | 'switch'
  | 'router'
  | 'workstation';

export interface Container {
  id: string;
  name: string;
  type: ContainerType;
  ip: string;
  image?: string;
  status?: 'running' | 'stopped' | 'paused';
  metadata?: Record<string, string>;
}

export interface Connection {
  from: string;
  to: string;
  label?: string;
}

export interface Subnet {
  id: string;
  name: string;
  cidr: string;
  containers: Container[];
  connections: Connection[];
}

export interface Site {
  id: string;
  name: string;
  location: string;
  position: { x: number; y: number };
  subnets: Subnet[];
}

export interface TopologyData {
  sites: Site[];
  siteConnections: Connection[];
}

// ── Sample Data ────────────────────────────────────────────────────

export const sampleTopology: TopologyData = {
  sites: [
    {
      id: 'idaho-falls',
      name: 'Idaho Falls HQ',
      location: 'Idaho Falls, ID',
      position: { x: 280, y: 160 },
      subnets: [
        {
          id: 'if-corporate',
          name: 'Corporate Network',
          cidr: '10.0.1.0/24',
          containers: [
            { id: 'if-router-1', name: 'Core Router', type: 'router', ip: '10.0.1.1', status: 'running', image: 'vyos/vyos:latest' },
            { id: 'if-fw-1', name: 'Perimeter Firewall', type: 'firewall', ip: '10.0.1.2', status: 'running', image: 'pfsense/pfsense:latest' },
            { id: 'if-sw-1', name: 'Access Switch 01', type: 'switch', ip: '10.0.1.3', status: 'running', image: 'networkswitch:latest' },
            { id: 'if-web-1', name: 'Apache Webserver', type: 'web-server', ip: '10.0.1.10', status: 'running', image: 'httpd:2.4' },
            { id: 'if-ws-1', name: 'Admin Workstation', type: 'workstation', ip: '10.0.1.100', status: 'running', image: 'ubuntu:22.04' },
            { id: 'if-ws-2', name: 'Dev Workstation', type: 'workstation', ip: '10.0.1.101', status: 'running', image: 'ubuntu:22.04' },
            { id: 'if-ws-3', name: 'Analyst Workstation', type: 'workstation', ip: '10.0.1.102', status: 'running', image: 'ubuntu:22.04' },
          ],
          connections: [
            { from: 'if-router-1', to: 'if-fw-1' },
            { from: 'if-fw-1', to: 'if-sw-1' },
            { from: 'if-sw-1', to: 'if-web-1' },
            { from: 'if-sw-1', to: 'if-ws-1' },
            { from: 'if-sw-1', to: 'if-ws-2' },
            { from: 'if-sw-1', to: 'if-ws-3' },
          ],
        },
        {
          id: 'if-ot',
          name: 'OT / SCADA Network',
          cidr: '10.0.2.0/24',
          containers: [
            { id: 'if-ot-sw', name: 'OT Switch', type: 'switch', ip: '10.0.2.1', status: 'running', image: 'networkswitch:latest' },
            { id: 'if-plc-1', name: 'PLC Controller 01', type: 'plc', ip: '10.0.2.10', status: 'running', image: 'openplc:v3', metadata: { protocol: 'Modbus TCP', function: 'Pump Control' } },
            { id: 'if-plc-2', name: 'PLC Controller 02', type: 'plc', ip: '10.0.2.11', status: 'running', image: 'openplc:v3', metadata: { protocol: 'Modbus TCP', function: 'Valve Control' } },
            { id: 'if-plc-3', name: 'PLC Controller 03', type: 'plc', ip: '10.0.2.12', status: 'running', image: 'openplc:v3', metadata: { protocol: 'EtherNet/IP', function: 'Sensor Array' } },
            { id: 'if-ot-ws', name: 'HMI Workstation', type: 'workstation', ip: '10.0.2.100', status: 'running', image: 'ubuntu:22.04' },
          ],
          connections: [
            { from: 'if-ot-sw', to: 'if-plc-1' },
            { from: 'if-ot-sw', to: 'if-plc-2' },
            { from: 'if-ot-sw', to: 'if-plc-3' },
            { from: 'if-ot-sw', to: 'if-ot-ws' },
          ],
        },
        {
          id: 'if-dmz',
          name: 'DMZ',
          cidr: '10.0.3.0/24',
          containers: [
            { id: 'if-dmz-fw', name: 'DMZ Firewall', type: 'firewall', ip: '10.0.3.1', status: 'running', image: 'pfsense/pfsense:latest' },
            { id: 'if-dmz-web', name: 'Public Web Server', type: 'web-server', ip: '10.0.3.10', status: 'running', image: 'nginx:latest' },
            { id: 'if-dmz-file', name: 'Samba File Server', type: 'file-server', ip: '10.0.3.11', status: 'running', image: 'dperson/samba:latest' },
          ],
          connections: [
            { from: 'if-dmz-fw', to: 'if-dmz-web' },
            { from: 'if-dmz-fw', to: 'if-dmz-file' },
          ],
        },
      ],
    },
    {
      id: 'boise',
      name: 'Boise Branch',
      location: 'Boise, ID',
      position: { x: 200, y: 210 },
      subnets: [
        {
          id: 'bo-office',
          name: 'Office Network',
          cidr: '10.1.1.0/24',
          containers: [
            { id: 'bo-router-1', name: 'Branch Router', type: 'router', ip: '10.1.1.1', status: 'running', image: 'vyos/vyos:latest' },
            { id: 'bo-sw-1', name: 'Office Switch', type: 'switch', ip: '10.1.1.2', status: 'running', image: 'networkswitch:latest' },
            { id: 'bo-file-1', name: 'File Server', type: 'file-server', ip: '10.1.1.10', status: 'running', image: 'dperson/samba:latest' },
            { id: 'bo-ws-1', name: 'Workstation 01', type: 'workstation', ip: '10.1.1.100', status: 'running', image: 'ubuntu:22.04' },
            { id: 'bo-ws-2', name: 'Workstation 02', type: 'workstation', ip: '10.1.1.101', status: 'running', image: 'ubuntu:22.04' },
            { id: 'bo-ws-3', name: 'Workstation 03', type: 'workstation', ip: '10.1.1.102', status: 'running', image: 'ubuntu:22.04' },
            { id: 'bo-ws-4', name: 'Workstation 04', type: 'workstation', ip: '10.1.1.103', status: 'running', image: 'ubuntu:22.04' },
            { id: 'bo-ws-5', name: 'Workstation 05', type: 'workstation', ip: '10.1.1.104', status: 'running', image: 'ubuntu:22.04' },
          ],
          connections: [
            { from: 'bo-router-1', to: 'bo-sw-1' },
            { from: 'bo-sw-1', to: 'bo-file-1' },
            { from: 'bo-sw-1', to: 'bo-ws-1' },
            { from: 'bo-sw-1', to: 'bo-ws-2' },
            { from: 'bo-sw-1', to: 'bo-ws-3' },
            { from: 'bo-sw-1', to: 'bo-ws-4' },
            { from: 'bo-sw-1', to: 'bo-ws-5' },
          ],
        },
        {
          id: 'bo-lab',
          name: 'Lab Network',
          cidr: '10.1.2.0/24',
          containers: [
            { id: 'bo-lab-sw', name: 'Lab Switch', type: 'switch', ip: '10.1.2.1', status: 'running', image: 'networkswitch:latest' },
            { id: 'bo-lab-web', name: 'Test Web Server', type: 'web-server', ip: '10.1.2.10', status: 'running', image: 'httpd:2.4' },
            { id: 'bo-lab-ws-1', name: 'Lab Workstation 01', type: 'workstation', ip: '10.1.2.100', status: 'running', image: 'ubuntu:22.04' },
            { id: 'bo-lab-ws-2', name: 'Lab Workstation 02', type: 'workstation', ip: '10.1.2.101', status: 'running', image: 'ubuntu:22.04' },
          ],
          connections: [
            { from: 'bo-lab-sw', to: 'bo-lab-web' },
            { from: 'bo-lab-sw', to: 'bo-lab-ws-1' },
            { from: 'bo-lab-sw', to: 'bo-lab-ws-2' },
          ],
        },
      ],
    },
    {
      id: 'slc',
      name: 'Salt Lake City DC',
      location: 'Salt Lake City, UT',
      position: { x: 300, y: 300 },
      subnets: [
        {
          id: 'slc-dc',
          name: 'Data Center',
          cidr: '10.2.1.0/24',
          containers: [
            { id: 'slc-router-1', name: 'DC Router 01', type: 'router', ip: '10.2.1.1', status: 'running', image: 'vyos/vyos:latest' },
            { id: 'slc-router-2', name: 'DC Router 02', type: 'router', ip: '10.2.1.2', status: 'running', image: 'vyos/vyos:latest' },
            { id: 'slc-fw-1', name: 'DC Firewall', type: 'firewall', ip: '10.2.1.3', status: 'running', image: 'pfsense/pfsense:latest' },
            { id: 'slc-sw-1', name: 'DC Switch 01', type: 'switch', ip: '10.2.1.4', status: 'running', image: 'networkswitch:latest' },
            { id: 'slc-sw-2', name: 'DC Switch 02', type: 'switch', ip: '10.2.1.5', status: 'running', image: 'networkswitch:latest' },
            { id: 'slc-web-1', name: 'Prod Web 01', type: 'web-server', ip: '10.2.1.10', status: 'running', image: 'nginx:latest' },
            { id: 'slc-web-2', name: 'Prod Web 02', type: 'web-server', ip: '10.2.1.11', status: 'running', image: 'nginx:latest' },
            { id: 'slc-web-3', name: 'Prod Web 03', type: 'web-server', ip: '10.2.1.12', status: 'running', image: 'nginx:latest' },
            { id: 'slc-web-4', name: 'Prod Web 04', type: 'web-server', ip: '10.2.1.13', status: 'running', image: 'nginx:latest' },
            { id: 'slc-file-1', name: 'Storage Server 01', type: 'file-server', ip: '10.2.1.20', status: 'running', image: 'dperson/samba:latest' },
            { id: 'slc-file-2', name: 'Storage Server 02', type: 'file-server', ip: '10.2.1.21', status: 'running', image: 'dperson/samba:latest' },
          ],
          connections: [
            { from: 'slc-router-1', to: 'slc-fw-1' },
            { from: 'slc-router-2', to: 'slc-fw-1' },
            { from: 'slc-fw-1', to: 'slc-sw-1' },
            { from: 'slc-fw-1', to: 'slc-sw-2' },
            { from: 'slc-sw-1', to: 'slc-web-1' },
            { from: 'slc-sw-1', to: 'slc-web-2' },
            { from: 'slc-sw-1', to: 'slc-file-1' },
            { from: 'slc-sw-2', to: 'slc-web-3' },
            { from: 'slc-sw-2', to: 'slc-web-4' },
            { from: 'slc-sw-2', to: 'slc-file-2' },
          ],
        },
      ],
    },
    {
      id: 'portland',
      name: 'Portland Office',
      location: 'Portland, OR',
      position: { x: 120, y: 130 },
      subnets: [
        {
          id: 'pdx-office',
          name: 'Office Network',
          cidr: '10.3.1.0/24',
          containers: [
            { id: 'pdx-router', name: 'Office Router', type: 'router', ip: '10.3.1.1', status: 'running', image: 'vyos/vyos:latest' },
            { id: 'pdx-sw', name: 'Office Switch', type: 'switch', ip: '10.3.1.2', status: 'running', image: 'networkswitch:latest' },
            { id: 'pdx-ws-1', name: 'Workstation 01', type: 'workstation', ip: '10.3.1.100', status: 'running', image: 'ubuntu:22.04' },
            { id: 'pdx-ws-2', name: 'Workstation 02', type: 'workstation', ip: '10.3.1.101', status: 'running', image: 'ubuntu:22.04' },
            { id: 'pdx-ws-3', name: 'Workstation 03', type: 'workstation', ip: '10.3.1.102', status: 'running', image: 'ubuntu:22.04' },
          ],
          connections: [
            { from: 'pdx-router', to: 'pdx-sw' },
            { from: 'pdx-sw', to: 'pdx-ws-1' },
            { from: 'pdx-sw', to: 'pdx-ws-2' },
            { from: 'pdx-sw', to: 'pdx-ws-3' },
          ],
        },
      ],
    },
    {
      id: 'denver',
      name: 'Denver Operations',
      location: 'Denver, CO',
      position: { x: 400, y: 290 },
      subnets: [
        {
          id: 'den-ops',
          name: 'Operations Network',
          cidr: '10.4.1.0/24',
          containers: [
            { id: 'den-router', name: 'Ops Router', type: 'router', ip: '10.4.1.1', status: 'running', image: 'vyos/vyos:latest' },
            { id: 'den-fw', name: 'Ops Firewall', type: 'firewall', ip: '10.4.1.2', status: 'running', image: 'pfsense/pfsense:latest' },
            { id: 'den-sw', name: 'Ops Switch', type: 'switch', ip: '10.4.1.3', status: 'running', image: 'networkswitch:latest' },
            { id: 'den-web', name: 'Monitoring Server', type: 'web-server', ip: '10.4.1.10', status: 'running', image: 'grafana/grafana:latest' },
            { id: 'den-ws-1', name: 'NOC Workstation 01', type: 'workstation', ip: '10.4.1.100', status: 'running', image: 'ubuntu:22.04' },
            { id: 'den-ws-2', name: 'NOC Workstation 02', type: 'workstation', ip: '10.4.1.101', status: 'running', image: 'ubuntu:22.04' },
          ],
          connections: [
            { from: 'den-router', to: 'den-fw' },
            { from: 'den-fw', to: 'den-sw' },
            { from: 'den-sw', to: 'den-web' },
            { from: 'den-sw', to: 'den-ws-1' },
            { from: 'den-sw', to: 'den-ws-2' },
          ],
        },
        {
          id: 'den-ot',
          name: 'Field OT Network',
          cidr: '10.4.2.0/24',
          containers: [
            { id: 'den-ot-sw', name: 'Field Switch', type: 'switch', ip: '10.4.2.1', status: 'running', image: 'networkswitch:latest' },
            { id: 'den-plc-1', name: 'Field PLC 01', type: 'plc', ip: '10.4.2.10', status: 'running', image: 'openplc:v3', metadata: { protocol: 'Modbus TCP', function: 'Flow Meter' } },
            { id: 'den-plc-2', name: 'Field PLC 02', type: 'plc', ip: '10.4.2.11', status: 'running', image: 'openplc:v3', metadata: { protocol: 'DNP3', function: 'Breaker Control' } },
          ],
          connections: [
            { from: 'den-ot-sw', to: 'den-plc-1' },
            { from: 'den-ot-sw', to: 'den-plc-2' },
          ],
        },
      ],
    },
  ],
  siteConnections: [
    { from: 'idaho-falls', to: 'boise', label: 'MPLS' },
    { from: 'idaho-falls', to: 'slc', label: 'MPLS' },
    { from: 'idaho-falls', to: 'denver', label: 'VPN' },
    { from: 'boise', to: 'portland', label: 'VPN' },
    { from: 'slc', to: 'denver', label: 'MPLS' },
  ],
};
