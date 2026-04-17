"use client";

import { useEffect, useState, useRef, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";
import { Session, Participant, BillItem } from "@/features/session/types";
import SaveAsImage from "@/components/sessions/SaveAsImage";
import SessionErrorState from "@/features/session/components/SessionErrorState";
import {
  Users,
  UtensilsCrossed,
  Receipt,
  Banknote,
  BarChart3,
  ArrowRightLeft,
  Plus,
  PlusCircle,
  X,
  Pencil,
  ArrowLeft,
  ChevronDown,
  QrCode,
  Smartphone,
  Copy,
  Check,
  FileText,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

const t = {
  appName: "عالنوتة",
  addParticipant: "ضيف حد",
  participantName: "إسم صاحبك",
  add: "ضيف",
  addItem: "زود طلب",
  itemName: "الطلب",
  amount: "السعر",
  selectPerson: "مين اللي طلب؟",
  taxService: "ضريبة + خدمة",
  chargeAmount: "المبلغ",
  payments: "مين دفع كام؟",
  save: "سجّل",
  calculate: "احسب الحسبة",
  refresh: "رفرش",
  back: "ارجع",
  participants: "صحابك",
  items: "الطلبات",
  noParticipants: "ضيف صحابك الأول",
  addFirstParticipant: "دوس ع الـ (+) عشان تضيف أول واحد",
  noItems: "لسه مفيش طلبات",
  addFirstItem: "زود طلباتكم من المنيو",
  noCharges: "مفيش ضريبة أو خدمة",
  addFirstCharge: "زود الضريبة والخدمة هنا",
  noSettlements: "كله في اللذيذ! 💚",
  paid: "دفع",
  currency: "ج.م",
  delete: "حذف",
  edit: "تعديل",
  draft: "لسه بنجمع",
  calculated: "الحسبة خلصت",
  settled: "كله دفع",
  copyLink: "انسخ اللينك",
  showQR: "شير الحسبة",
  notFound: "الحسبة دي مش لاقينها",
  tapToExpand: "دوس هنا عشان التفاصيل",
};

interface ExpandedSections {
  participants: boolean;
  items: boolean;
  charges: boolean;
  payments: boolean;
  results: boolean;
  settlements: boolean;
}

const Section = ({
  title,
  sectionKey,
  icon,
  children,
  count = 0,
  expandable = false,
  isExpanded,
  isAnimating,
  onToggle
}: {
  title: string;
  sectionKey: keyof ExpandedSections;
  icon: React.ReactNode;
  children: React.ReactNode;
  count?: number;
  expandable?: boolean;
  isExpanded: boolean;
  isAnimating: boolean;
  onToggle: (key: keyof ExpandedSections) => void;
}) => {
  return (
    <section className={`content-section collapsible ${isExpanded ? 'expanded' : 'collapsed'} ${isAnimating ? 'animating' : ''}`}>
      <button
        className="section-header"
        onClick={() => expandable && onToggle(sectionKey)}
        disabled={!expandable}
      >
        <span className="section-title">
          <span className="section-icon">{icon}</span>
          {title}
          {count > 0 && <span className="section-count">{count}</span>}
        </span>
        {expandable && (
          <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>
            <ChevronDown size={18} />
          </span>
        )}
      </button>
      <div className="section-content">
        {children}
      </div>
      {expandable && !isExpanded && (
        <div className="expand-hint">{t.tapToExpand}</div>
      )}
    </section>
  );
};

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const receiptRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [calculateResult, setCalculateResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [toast, setToast] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedSections>({
    participants: true,
    items: false,
    charges: false,
    payments: false,
    results: false,
    settlements: false,
  });
  const [animatingSection, setAnimatingSection] = useState<string | null>(null);

  const [newParticipantName, setNewParticipantName] = useState("");
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null);
  const [editParticipantName, setEditParticipantName] = useState("");
  const [newItem, setNewItem] = useState({ name: "", amount: "", participantId: "" });
  const [newCharge, setNewCharge] = useState({ amount: "" });

  useEffect(() => {
    loadSession();
  }, [resolvedParams.sessionId, token]);

  const loadSession = async () => {
    try {
      const endpoint = token
        ? `/api/sessions/${resolvedParams.sessionId}?viewerToken=${token}`
        : `/api/sessions/${resolvedParams.sessionId}`;

      const data = await apiClient<Session>(endpoint);
      setSession(data);

      const hasOrganizerToken = !!(token && token.startsWith("org_"));
      setIsOrganizer(hasOrganizerToken);
      setIsCalculated(data.status === "Calculated" || data.status === "Settled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: keyof ExpandedSections) => {
    setAnimatingSection(section);
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    setTimeout(() => setAnimatingSection(null), 300);
  };

  const handleBack = () => {
    if (isCalculated) {
      setIsCalculated(false);
      setCalculateResult(null);
    } else {
      router.push("/");
    }
  };

  const handleShowQR = () => {
    if (!session) return;
    const viewerToken = session.viewerToken;
    if (viewerToken) {
      setShowQR(true);
    } else {
      copyLink();
    }
  };

  const copyLink = async () => {
    if (!session) return;
    const viewerToken = session.viewerToken;
    const url = viewerToken
      ? `${window.location.origin}/sessions/${session.sessionId}?token=${viewerToken}`
      : `${window.location.origin}/sessions/${session.sessionId}`;
    await navigator.clipboard.writeText(url);
    showToast("اللينك اتنسخ!");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const calculateSession = async () => {
    if (!isOrganizer || !token) return;
    try {
      const result = await apiClient<any>(`/api/sessions/${resolvedParams.sessionId}/calculate`, {
        method: "POST",
        organizerToken: token,
      });
      setCalculateResult(result);
      setIsCalculated(true);
      setExpanded({ participants: true, items: false, charges: false, payments: false, results: true, settlements: true });
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate");
    }
  };

  const replacePayments = async (payments: { participantId: string; paidAmount: string }[]) => {
    if (!isOrganizer || !token) return;
    try {
      await apiClient<void>(`/api/sessions/${resolvedParams.sessionId}/payments`, {
        method: "PUT",
        body: { payments },
        organizerToken: token,
      });
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payments");
    }
  };

  const addParticipant = async () => {
    if (!isOrganizer || !token || !newParticipantName.trim()) return;
    try {
      await apiClient<Participant>(`/api/sessions/${resolvedParams.sessionId}/participants`, {
        method: "POST",
        body: { displayName: newParticipantName },
        organizerToken: token,
      });
      setNewParticipantName("");
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    }
  };

  const updateParticipant = async (participantId: string) => {
    if (!isOrganizer || !token || !editParticipantName.trim()) return;
    try {
      await apiClient<Participant>(`/api/sessions/${resolvedParams.sessionId}/participants/${participantId}`, {
        method: "PUT",
        body: { displayName: editParticipantName },
        organizerToken: token,
      });
      setEditingParticipant(null);
      setEditParticipantName("");
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const deleteParticipant = async (participantId: string) => {
    if (!isOrganizer || !token) return;
    if (!confirm("متأكد إنك عايز تشيل صاحبك ده؟")) return;
    try {
      await apiClient<void>(`/api/sessions/${resolvedParams.sessionId}/participants/${participantId}`, {
        method: "DELETE",
        organizerToken: token,
      });
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const addItem = async () => {
    if (!isOrganizer || !token || !newItem.name || !newItem.amount || !newItem.participantId) return;
    try {
      await apiClient<BillItem>(`/api/sessions/${resolvedParams.sessionId}/items`, {
        method: "POST",
        body: {
          name: newItem.name,
          amount: newItem.amount,
          assignments: [{ participantId: newItem.participantId, ratioNumerator: 1, ratioDenominator: 1 }]
        },
        organizerToken: token,
      });
      setNewItem({ name: "", amount: "", participantId: "" });
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!isOrganizer || !token) return;
    if (!confirm("متأكد إنك عايز تحذف الطلب ده؟")) return;
    try {
      await apiClient<void>(`/api/sessions/${resolvedParams.sessionId}/items/${itemId}`, {
        method: "DELETE",
        organizerToken: token,
      });
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const addCharge = async () => {
    if (!isOrganizer || !token || !newCharge.amount) return;
    try {
      await apiClient<void>(`/api/sessions/${resolvedParams.sessionId}/charges`, {
        method: "PUT",
        body: { charges: [{ type: "both", amount: newCharge.amount }] },
        organizerToken: token,
      });
      setNewCharge({ amount: "" });
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add charge");
    }
  };

  const settlements: any[] = calculateResult?.settlements || [];

  if (isLoading) {
    return (
      <div className="arabic-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>بنفتح النوتة...</p>
        </div>
      </div>
    );
  }
  if (error || !session) {
    const isNotFound = error?.toLowerCase().includes("not found");
    const isUnauthorized = error?.toLowerCase().includes("unauthorized") || error?.toLowerCase().includes("forbidden");

    return (
      <div className="arabic-container">
        <SessionErrorState
          type={isNotFound ? 'not-found' : isUnauthorized ? 'unauthorized' : 'server-error'}
          message={error}
        />
      </div>
    );
  }

  const numParticipants = session.participants.length || 1;
  const viewerToken = session.viewerToken;
  const shareUrl = viewerToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/sessions/${session.sessionId}?token=${viewerToken}` : '';



  return (
    <div className="arabic-container">
      <header className="app-header">
        <button className="header-icon" onClick={handleBack} aria-label={t.back}>
          <ArrowLeft size={20} />
        </button>
        <h1>{session.name || t.appName}</h1>
        <button className="header-icon" onClick={handleShowQR} aria-label={t.showQR}>
          <QrCode size={20} />
        </button>
      </header>

      <div className="status-badge" data-status={session.status}>
        {session.status === "Draft" ? (
          <>
            <FileText size={14} />
            <span>لسه بنجهز</span>
          </>
        ) : session.status === "Calculated" || session.status === "Settled" ? (
          <>
            <CheckCircle2 size={14} />
            <span>خلصت</span>
          </>
        ) : null}
      </div>

      {toast && <div className="toast">{toast}</div>}

      {showQR && shareUrl && <QRModal url={shareUrl} onClose={() => setShowQR(false)} onCopy={copyLink} />}

      <div ref={receiptRef} className="receipt-capture-container">
        {isCalculated && (
          <div className="summary-stats">
            <div className="stat-box">
              <span className="stat-num">{session.items.length}</span>
              <span className="stat-label">طلبات</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{session.participants.length}</span>
              <span className="stat-label">أصحاب</span>
            </div>
          </div>
        )}

        <Section title={t.participants} sectionKey="participants" icon={<Users size={18} />} count={session.participants.length} expandable={session.participants.length > 0} isExpanded={expanded.participants} isAnimating={animatingSection === "participants"} onToggle={toggleSection}>
          {isOrganizer && session.status === "Draft" && (
            <div className="input-group">
              <input
                type="text"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                placeholder={t.participantName}
              />
              <button className="add-btn" onClick={addParticipant}>
                <Plus size={20} />
              </button>
            </div>
          )}

          <div className="list">
            {session.participants.map(p => (
              <ParticipantRow
                key={p.participantId}
                participant={p}
                isOrganizer={isOrganizer}
                isDraft={session.status === "Draft"}
                editing={editingParticipant === p.participantId}
                editName={editParticipantName}
                onEditNameChange={setEditParticipantName}
                onStartEdit={() => { setEditingParticipant(p.participantId); setEditParticipantName(p.displayName); }}
                onSaveEdit={() => updateParticipant(p.participantId)}
                onCancelEdit={() => setEditingParticipant(null)}
                onDelete={() => deleteParticipant(p.participantId)}
              />
            ))}
            {session.participants.length === 0 && (
              <div className="empty-state">
                <p>{t.noParticipants}</p>
                <span className="empty-hint">{t.addFirstParticipant}</span>
              </div>
            )}
          </div>
        </Section>

        <Section title={t.items} sectionKey="items" icon={<UtensilsCrossed size={18} />} count={session.items.length} expandable isExpanded={expanded.items} isAnimating={animatingSection === "items"} onToggle={toggleSection}>
          {isOrganizer && session.status === "Draft" && (
            <>
              <div className="input-group">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder={t.itemName}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                  placeholder="0"
                  style={{ width: "80px" }}
                />
                <button className="add-btn" onClick={addItem} disabled={!newItem.participantId}>
                  <Plus size={20} />
                </button>
              </div>
              <select
                value={newItem.participantId}
                onChange={(e) => setNewItem({ ...newItem, participantId: e.target.value })}
                className="person-select"
              >
                <option value="">{t.selectPerson}</option>
                {session.participants.map(p => (
                  <option key={p.participantId} value={p.participantId}>{p.displayName}</option>
                ))}
              </select>
            </>
          )}

          <div className="list">
            {session.items.map(item => {
              const assignedTo = item.assignments.map(a =>
                session.participants.find(p => p.participantId === a.participantId)?.displayName
              ).filter(Boolean).join("، ");
              return (
                <div key={item.itemId} className="item-row">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-assigned">← {assignedTo}</span>
                  </div>
                  <div className="item-right">
                    <span className="amount">{item.amount}</span>
                    {isOrganizer && session.status === "Draft" && (
                      <button className="delete-btn" onClick={() => deleteItem(item.itemId)}>
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {session.items.length === 0 && (
              <div className="empty-state">
                <p>{t.noItems}</p>
                <span className="empty-hint">{t.addFirstItem}</span>
              </div>
            )}
          </div>
        </Section>

        <Section title={t.taxService} sectionKey="charges" icon={<Receipt size={18} />} count={session.charges.length} expandable isExpanded={expanded.charges} isAnimating={animatingSection === "charges"} onToggle={toggleSection}>
          {isOrganizer && session.status === "Draft" && (
            <div className="input-group">
              <input
                type="number"
                value={newCharge.amount}
                onChange={(e) => setNewCharge({ amount: e.target.value })}
                placeholder={t.chargeAmount}
              />
              <button className="add-btn" onClick={addCharge}>
                <Plus size={20} />
              </button>
            </div>
          )}

          <div className="list">
            {session.charges.map(c => (
              <div key={c.chargeId} className="list-item">
                <span>{t.taxService}</span>
                <span className="amount">{(parseFloat(c.amount) / numParticipants).toFixed(0)} {t.currency}</span>
              </div>
            ))}
            {session.charges.length === 0 && (
              <div className="empty-state">
                <p>{t.noCharges}</p>
                <span className="empty-hint">{t.addFirstCharge}</span>
              </div>
            )}
          </div>
        </Section>

        {isOrganizer && session.status === "Draft" && session.participants.length > 0 && (
          <Section title={t.payments} sectionKey="payments" icon={<Banknote size={18} />} expandable isExpanded={expanded.payments} isAnimating={animatingSection === "payments"} onToggle={toggleSection}>
            <PaymentEditor
              participants={session.participants}
              onSubmit={replacePayments}
            />
          </Section>
        )}

        {isCalculated && (
          <Section title="النتيجة" sectionKey="results" icon={<BarChart3 size={18} />} expandable isExpanded={expanded.results} isAnimating={animatingSection === "results"} onToggle={toggleSection}>
            <div className="results-list">
              {session.participants.map(p => {
                const balance = parseFloat(p.balance);
                return (
                  <div key={p.participantId} className={`result-card ${balance > 0 ? "positive" : balance < 0 ? "negative" : "neutral"}`}>
                    <div className="result-name">{p.displayName}</div>
                    <div className="result-details">
                      <div>المجموع: <strong>{p.finalAmount} {t.currency}</strong></div>
                      <div>مدفوع: {p.paidAmount} {t.currency}</div>
                      <div className={`result-balance ${balance > 0 ? "gets-back" : balance < 0 ? "owes" : ""}`}>
                        {balance > 0 ? (
                          <>
                            <Check size={14} />
                            <span>ليه {balance.toFixed(0)}</span>
                          </>
                        ) : balance < 0 ? (
                          <>
                            <div className="dot" />
                            <span>عليه {Math.abs(balance).toFixed(0)}</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            <span>خلاص</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {isCalculated && settlements.length > 0 && (
          <Section title="التسوية" sectionKey="settlements" icon={<ArrowRightLeft size={18} />} expandable isExpanded={expanded.settlements} isAnimating={animatingSection === "settlements"} onToggle={toggleSection}>
            <div className="settlements-list">
              {settlements.map((s, idx) => {
                const fromName = session.participants.find(p => p.participantId === s.fromParticipantId)?.displayName || "";
                const toName = session.participants.find(p => p.participantId === s.toParticipantId)?.displayName || "";
                return (
                  <div key={idx} className="settlement-item">
                    <span className="from">{fromName}</span>
                    <ArrowLeft size={16} className="owes-arrow" />
                    <span className="to">{toName}</span>
                    <span className="amount">{s.amount.toFixed(0)} {t.currency}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {isCalculated && settlements.length === 0 && (
          <div className="all-settled">{t.noSettlements}</div>
        )}
      </div>

      {isOrganizer && (
        <div className="action-area">
          {session.status === "Draft" ? (
            <button className="calculate-btn" onClick={calculateSession}>
              حساب الحسبة
            </button>
          ) : (
            <>
              <button className="refresh-btn" onClick={loadSession}>
                <RefreshCw size={18} />
                <span>تحديث</span>
              </button>
              {isCalculated && (
                <SaveAsImage containerRef={receiptRef} sessionName={session.name} />
              )}
            </>
          )}
        </div>
      )}

      {!isOrganizer && isCalculated && (
        <div className="action-area">
          <SaveAsImage containerRef={receiptRef} sessionName={session?.name} />
        </div>
      )}

      {showQR && (
        <QRModal
          url={shareUrl}
          onClose={() => setShowQR(false)}
          onCopy={copyLink}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function ParticipantRow({
  participant,
  isOrganizer,
  isDraft,
  editing,
  editName,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete
}: {
  participant: Participant;
  isOrganizer: boolean;
  isDraft: boolean;
  editing: boolean;
  editName: string;
  onEditNameChange: (s: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="participant-item">
      {editing ? (
        <div className="edit-form">
          <input
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
          />
          <button onClick={onSaveEdit} className="save-edit-btn">
            <Check size={16} />
          </button>
          <button onClick={onCancelEdit} className="cancel-edit-btn">
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <span className="name">{participant.displayName}</span>
          {isOrganizer && isDraft && (
            <div className="actions">
              <button className="edit-btn" onClick={onStartEdit}>
                <Pencil size={14} />
              </button>
              <button className="delete-btn" onClick={onDelete}>
                <X size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PaymentEditor({
  participants,
  onSubmit
}: {
  participants: Participant[];
  onSubmit: (payments: { participantId: string; paidAmount: string }[]) => void;
}) {
  const [payments, setPayments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    participants.forEach(p => {
      initial[p.participantId] = p.paidAmount || "0";
    });
    return initial;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const paymentUpdates = Object.entries(payments).map(([participantId, paidAmount]) => ({
      participantId,
      paidAmount,
    }));
    await onSubmit(paymentUpdates);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      {participants.map((p) => (
        <div key={p.participantId} className="payment-row">
          <label>{p.displayName}</label>
          <input
            type="number"
            value={payments[p.participantId]}
            onChange={(e) => setPayments(prev => ({ ...prev, [p.participantId]: e.target.value }))}
            placeholder="0"
          />
        </div>
      ))}
      <button type="submit" disabled={isLoading} className="save-btn">
        {isLoading ? "..." : "حفظ"}
      </button>
    </form>
  );
}

function QRModal({ url, onClose, onCopy }: { url: string; onClose: () => void; onCopy: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    import("qrcode").then(({ default: QRCode }) => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: 200,
          margin: 2,
          color: {
            dark: "#f5f0e8",
            light: "#2d261e"
          }
        });
      }
    });
  }, [url]);

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={e => e.stopPropagation()}>
        <div className="qr-header">
          <Smartphone size={24} />
          <h3>امسح للدخول</h3>
        </div>
        <canvas ref={canvasRef}></canvas>
        <div className="qr-url">{url}</div>
        <div className="qr-actions">
          <button className="qr-copy-btn" onClick={onCopy}>
            <Copy size={18} />
            <span>نسخ الرابط</span>
          </button>
          <button className="qr-close-btn" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}