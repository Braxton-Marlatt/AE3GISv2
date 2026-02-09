import type { Container } from '../data/sampleTopology';

interface TerminalOverlayProps {
  container: Container;
  onClose: () => void;
}

export function TerminalOverlay({ container, onClose }: TerminalOverlayProps) {
  return (
    <div className="terminal-overlay" onClick={onClose}>
      <div
        className="terminal-window"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="terminal-titlebar">
          <span className="terminal-titlebar-text">
            ssh {container.ip} — {container.name}
          </span>
          <button className="terminal-titlebar-close" onClick={onClose}>
            x
          </button>
        </div>
        <div className="terminal-body">
          <div className="terminal-line">
            <span style={{ color: '#808090' }}>
              Connecting to {container.ip}...
            </span>
          </div>
          <div className="terminal-line">
            <span style={{ color: '#808090' }}>
              Container: {container.image || 'unknown'}
            </span>
          </div>
          <div className="terminal-line">
            <span style={{ color: '#00ff9f' }}>Connection established.</span>
          </div>
          <div className="terminal-line">&nbsp;</div>
          <div className="terminal-line">
            <span className="terminal-prompt">
              root@{container.name.toLowerCase().replace(/\s+/g, '-')}
            </span>
            <span style={{ color: '#808090' }}>:</span>
            <span style={{ color: '#4466ff' }}>~</span>
            <span style={{ color: '#808090' }}>$ </span>
            <span className="terminal-cursor" />
          </div>
          <div className="terminal-line" style={{ marginTop: '20px' }}>
            <span style={{ color: '#505060', fontSize: '11px' }}>
              [ Terminal session mock — connect to Docker backend for live access ]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
