"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Share2, Users, Scan, X, Wifi, Loader2, Copy, Check } from "lucide-react";
import { PeerSyncService } from "@/services/peerSyncService";
import { Session } from "../types";

export interface MultiplayerMenuHandle {
  sendAction: (action: string, payload: any) => void;
}

interface MultiplayerMenuProps {
  session: Session;
  onRemoteAction: (action: string, payload: any) => void;
  onRemoteStateUpdate: (state: Session) => void;
}

const MultiplayerMenu = forwardRef<MultiplayerMenuHandle, MultiplayerMenuProps>(({
  session,
  onRemoteAction,
  onRemoteStateUpdate
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'idle' | 'host' | 'join'>('idle');
  const [peerId, setPeerId] = useState<string | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [copied, setCopied] = useState(false);

  const syncService = useRef<PeerSyncService | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Expose sendAction so the parent page can trigger P2P sync after local edits
  useImperativeHandle(ref, () => ({
    sendAction: (action: string, payload: any) => {
      if (status === 'connected') {
        if (mode === 'host') {
          syncService.current?.broadcast({ type: 'ACTION', action, payload });
        } else {
          syncService.current?.sendToHost({ type: 'ACTION', action, payload });
        }
      }
    }
  }));

  useEffect(() => {
    return () => {
      syncService.current?.destroy();
      try { scannerRef.current?.clear(); } catch (_) {}
    };
  }, []);

  // When the host's session state changes, broadcast it to all connected peers
  // and also keep latestState updated so new joiners get the current state on connect
  useEffect(() => {
    if (status === 'connected' && mode === 'host') {
      syncService.current?.setCurrentState(session);
      syncService.current?.broadcast({ type: 'STATE_SYNC', state: session });
    }
  }, [session, status, mode]);

  const startHosting = async () => {
    setStatus('connecting');
    setMode('host');

    const service = new PeerSyncService(
      onRemoteStateUpdate,
      (action, payload) => {
        // Host receives ACTION messages from joiners, executes them, then
        // the session state change will trigger the broadcast useEffect above
        onRemoteAction(action, payload);
      }
    );

    service.setAsHost(true);
    try {
      const id = await service.init(`3alnota-${session.sessionId}`);
      setPeerId(id);
      setStatus('connected');
      syncService.current = service;
    } catch (err) {
      console.error("Failed to start hosting", err);
      setStatus('disconnected');
      setMode('idle');
    }
  };

  const startJoining = () => {
    setMode('join');
    // Allow the DOM to render the #reader div before initializing
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          connectToPeer(decodedText);
          try { scanner.clear(); } catch (_) {}
        },
        (_error) => { /* scan errors are expected, ignore */ }
      );

      scannerRef.current = scanner;
    }, 200);
  };

  const connectToPeer = async (hostId: string) => {
    setStatus('connecting');
    const service = new PeerSyncService(
      (state) => onRemoteStateUpdate(state),
      (action, payload) => onRemoteAction(action, payload)
    );

    try {
      await service.init();
      await service.connectToHost(hostId);
      syncService.current = service;
      setStatus('connected');
      setMode('idle');
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to join", err);
      setStatus('disconnected');
      setMode('idle');
    }
  };

  const copyId = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (mode !== 'host') setMode('idle'); // keep host alive when closing modal
    try { scannerRef.current?.clear(); } catch (_) {}
  };

  return (
    <div className="multiplayer-container">
      <button
        className={`multiplayer-toggle ${status === 'connected' ? 'mp-active' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Share session"
      >
        {status === 'connected' ? <Wifi size={20} /> : <Share2 size={20} />}
        <span>{status === 'connected' ? 'أونلاين' : 'شارك الحسبة'}</span>
      </button>

      {isOpen && (
        <div className="mp-modal-overlay" onClick={handleClose}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h2>شارك الحسبة مع صحابك</h2>
              <button onClick={handleClose} className="mp-close-btn">
                <X size={24} />
              </button>
            </div>

            <div className="mp-modal-body">
              {mode === 'idle' && (
                <div className="mp-mode-selection">
                  <button className="mp-mode-btn" onClick={startHosting}>
                    <Users size={32} className="mp-mode-icon" />
                    <div className="mp-mode-text">
                      <h3>افتح طاولة</h3>
                      <p>خلي صحابك يدخلوا معاك ويضيفوا طلباتهم</p>
                    </div>
                  </button>

                  <button className="mp-mode-btn" onClick={startJoining}>
                    <Scan size={32} className="mp-mode-icon" />
                    <div className="mp-mode-text">
                      <h3>ادخل طاولة</h3>
                      <p>امسح الكود وشارك في الحسبة</p>
                    </div>
                  </button>
                </div>
              )}

              {mode === 'host' && (
                <div className="mp-host-display">
                  {status === 'connecting' ? (
                    <div className="mp-loading">
                      <Loader2 className="mp-spin" size={48} />
                      <p>بنجهز الكود...</p>
                    </div>
                  ) : (
                    <>
                      <div className="mp-qr-container">
                        <QRCodeSVG
                          value={peerId || ""}
                          size={200}
                          includeMargin
                        />
                      </div>
                      <div className="mp-peer-id" onClick={copyId}>
                        <code>{peerId}</code>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </div>
                      <p className="mp-hint">خلي صحابك يمسحوا الكود ده عشان يدخلوا معاك</p>
                    </>
                  )}
                </div>
              )}

              {mode === 'join' && (
                <div className="mp-join-display">
                  <div id="qr-reader" style={{ width: '100%' }} />
                  <p className="mp-hint">وجه الكاميرا ناحية كود صاحبك</p>
                </div>
              )}

              {status === 'connecting' && mode !== 'host' && (
                <div className="mp-loading">
                  <Loader2 className="mp-spin" size={48} />
                  <p>بنكنكت...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MultiplayerMenu.displayName = "MultiplayerMenu";

export default MultiplayerMenu;
