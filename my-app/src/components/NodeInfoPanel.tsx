import type { Container } from '../data/sampleTopology';

interface NodeInfoPanelProps {
  container: Container | null;
  onClose: () => void;
  onOpenTerminal: (container: Container) => void;
}

const typeDisplayNames: Record<string, string> = {
  'web-server': 'Web Server',
  'file-server': 'File Server',
  'plc': 'PLC Controller',
  'firewall': 'Firewall',
  'switch': 'Network Switch',
  'router': 'Router',
  'workstation': 'Workstation',
};

export function NodeInfoPanel({
  container,
  onClose,
  onOpenTerminal,
}: NodeInfoPanelProps) {
  return (
    <div className={`info-panel ${container ? 'open' : ''}`}>
      {container && (
        <>
          <div className="info-panel-header">
            <div className="info-panel-title">NODE INFO</div>
            <button className="info-panel-close" onClick={onClose}>
              x
            </button>
          </div>

          <div className="info-panel-body">
            <div className="info-field">
              <div className="info-label">Name</div>
              <div className="info-value">{container.name}</div>
            </div>

            <div className="info-field">
              <div className="info-label">Type</div>
              <div className="info-value">
                {typeDisplayNames[container.type] || container.type}
              </div>
            </div>

            <div className="info-field">
              <div className="info-label">IP Address</div>
              <div className="info-value">{container.ip}</div>
            </div>

            {container.image && (
              <div className="info-field">
                <div className="info-label">Image</div>
                <div className="info-value">{container.image}</div>
              </div>
            )}

            {container.status && (
              <div className="info-field">
                <div className="info-label">Status</div>
                <div
                  className={`info-value status-${container.status}`}
                >
                  {container.status.toUpperCase()}
                </div>
              </div>
            )}

            {container.metadata && Object.keys(container.metadata).length > 0 && (
              <>
                <div
                  style={{
                    height: '1px',
                    background: '#1e1e2e',
                    margin: '16px 0',
                  }}
                />
                <div className="info-field">
                  <div className="info-label">Metadata</div>
                </div>
                {Object.entries(container.metadata).map(([key, value]) => (
                  <div className="info-field" key={key}>
                    <div className="info-label">{key}</div>
                    <div className="info-value">{value}</div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="info-panel-actions">
            <button
              className="btn-terminal"
              onClick={() => onOpenTerminal(container)}
            >
              Open Terminal
            </button>
          </div>
        </>
      )}
    </div>
  );
}
