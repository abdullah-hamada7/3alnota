import type { Peer, DataConnection } from 'peerjs';
import { Session } from '../features/session/types';

export type SyncMessage =
  | { type: 'STATE_SYNC'; state: Session }
  | { type: 'ACTION'; action: string; payload: any };

export class PeerSyncService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private onStateUpdate: (state: Session) => void;
  private onAction: (action: string, payload: any) => void;
  private isHost: boolean = false;
  // Host stores the latest session state so it can send it to newly joined peers
  private latestState: Session | null = null;

  constructor(
    onStateUpdate: (state: Session) => void,
    onAction: (action: string, payload: any) => void
  ) {
    this.onStateUpdate = onStateUpdate;
    this.onAction = onAction;
  }

  /** Call this every time the session state changes (host only) */
  setCurrentState(state: Session) {
    this.latestState = state;
  }

  async init(customId?: string): Promise<string> {
    const { Peer } = await import('peerjs');

    return new Promise((resolve, reject) => {
      this.peer = customId ? new Peer(customId) : new Peer();

      this.peer.on('open', (id) => {
        console.log('[PeerSync] Peer opened with ID:', id);
        resolve(id);
      });

      this.peer.on('error', (err) => {
        console.error('[PeerSync] Peer error:', err);
        reject(err);
      });

      // Only hosts listen for incoming connections
      this.peer.on('connection', (conn) => {
        this.handleConnection(conn);
      });
    });
  }

  setAsHost(isHost: boolean) {
    this.isHost = isHost;
  }

  private handleConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      console.log('[PeerSync] Peer connected:', conn.peer, '— total:', this.connections.size);

      // Immediately send the current session state to the newly joined peer
      if (this.isHost && this.latestState) {
        conn.send({ type: 'STATE_SYNC', state: this.latestState } satisfies SyncMessage);
      }
    });

    conn.on('data', (data: unknown) => {
      const msg = data as SyncMessage;
      if (msg.type === 'STATE_SYNC') {
        this.onStateUpdate(msg.state);
      } else if (msg.type === 'ACTION') {
        this.onAction(msg.action, msg.payload);
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      console.log('[PeerSync] Peer disconnected:', conn.peer);
    });

    conn.on('error', (err) => {
      console.error('[PeerSync] Connection error:', err);
      this.connections.delete(conn.peer);
    });
  }

  async connectToHost(hostId: string): Promise<void> {
    if (!this.peer) throw new Error('Peer not initialized. Call init() first.');
    return new Promise((resolve, reject) => {
      const conn = this.peer!.connect(hostId);
      
      conn.on('open', () => {
        this.connections.set(conn.peer, conn);
        console.log('[PeerSync] Connected to host:', hostId);
        resolve();
      });

      conn.on('error', reject);

      // Attach data/close handlers
      this.handleConnectionDataOnly(conn);
    });
  }

  /** Only registers data + close handlers (open is handled separately in connectToHost) */
  private handleConnectionDataOnly(conn: DataConnection) {
    conn.on('data', (data: unknown) => {
      const msg = data as SyncMessage;
      if (msg.type === 'STATE_SYNC') {
        this.onStateUpdate(msg.state);
      } else if (msg.type === 'ACTION') {
        this.onAction(msg.action, msg.payload);
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });

    conn.on('error', (err) => {
      console.error('[PeerSync] Connection error:', err);
      this.connections.delete(conn.peer);
    });
  }

  broadcast(message: SyncMessage) {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }

  sendToHost(message: SyncMessage) {
    // Joiners have exactly one connection — to the host
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }

  destroy() {
    this.connections.forEach((c) => c.close());
    this.connections.clear();
    this.peer?.destroy();
    this.peer = null;
  }
}
