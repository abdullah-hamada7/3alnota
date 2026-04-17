"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Session, Participant, BillItem } from "@/features/session/types";

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
  Smartphone,
  Copy,
  Check,
  FileText,
  CheckCircle2
} from "lucide-react";
import * as sessionService from "@/services/sessionService";
import ConfirmModal from "@/components/shared/ConfirmModal";


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
    <section className={`content-section collapsible ${isExpanded ? 'expanded' : 'collapsed'} ${isAnimating ? 'animating' : ''} ${sectionKey}`}>
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
    </section>
  );
};

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [calculateResult, setCalculateResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  useEffect(() => {
    params.then(p => {
      setSessionId(p.sessionId);
    });
  }, [params]);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;
    try {
      const data = await sessionService.getSession(sessionId);
      setSession(data);
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const calculateSession = async () => {
    if (!sessionId) return;
    try {
      const result = await sessionService.calculateSession(sessionId);
      setCalculateResult(result);
      setIsCalculated(true);
      setExpanded({ participants: true, items: false, charges: false, payments: false, results: true, settlements: true });
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate");
    }
  };


  const replacePayments = async (payments: { participantId: string; paidAmount: string }[]) => {
    if (!sessionId) return;
    try {
      await sessionService.replacePayments(sessionId, payments);
      await loadSession();
      showToast("اتسجلت تمام ✅");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payments");
    }
  };


  const addParticipant = async () => {
    if (!sessionId || !newParticipantName.trim()) return;
    try {
      await sessionService.addParticipant(sessionId, newParticipantName);
      setNewParticipantName("");
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    }
  };


  const updateParticipant = async (participantId: string) => {
    if (!sessionId || !editParticipantName.trim()) return;
    try {
      await sessionService.updateParticipant(sessionId, participantId, editParticipantName);
      setEditingParticipant(null);
      setEditParticipantName("");
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };


  const deleteParticipant = async (participantId: string) => {
    if (!sessionId) return;
    setConfirmModal({
      isOpen: true,
      title: "تشيل صاحبك؟",
      message: "متأكد إنك عايز تشيل صاحبك ده من القائمة؟",
      onConfirm: async () => {
        try {
          await sessionService.deleteParticipant(sessionId, participantId);
          await loadSession();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to delete");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };


  const addItem = async () => {
    if (!sessionId || !newItem.name || !newItem.amount || !newItem.participantId) return;
    try {
      await sessionService.addBillItem(
        sessionId,
        newItem.name,
        newItem.amount,
        undefined,
        [{ participantId: newItem.participantId, ratioNumerator: 1, ratioDenominator: 1 }]
      );
      setNewItem({ name: "", amount: "", participantId: "" });
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  };


  const deleteItem = async (itemId: string) => {
    if (!sessionId) return;
    setConfirmModal({
      isOpen: true,
      title: "حذف الطلب؟",
      message: "متأكد إنك عايز تحذف الطلب ده من النوتة؟",
      onConfirm: async () => {
        try {
          await sessionService.deleteBillItem(sessionId, itemId);
          await loadSession();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to delete");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };


  const addCharge = async () => {
    if (!sessionId || !newCharge.amount) return;
    try {
      await sessionService.replaceCharges(sessionId, [{ type: "both", amount: newCharge.amount }]);
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

  return (
    <div className="arabic-container">
      <header className="app-header">
        <button className="header-icon" onClick={handleBack} aria-label={t.back}>
          <ArrowLeft size={20} />
        </button>
        <h1>{session.name || t.appName}</h1>
        <div style={{ width: 40 }} />
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

      <div className="session-main-content">
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

        <div className="stagger-1">
          <Section title={t.participants} sectionKey="participants" icon={<Users size={18} />} count={session.participants.length} expandable={true} isExpanded={expanded.participants} isAnimating={animatingSection === "participants"} onToggle={toggleSection}>
            {session.status === "Draft" && (
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
                  isOrganizer={true}
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
        </div>

        <div className="stagger-2">
          <Section title={t.items} sectionKey="items" icon={<UtensilsCrossed size={18} />} count={session.items.length} expandable isExpanded={expanded.items} isAnimating={animatingSection === "items"} onToggle={toggleSection}>
            {session.status === "Draft" && (
              <>
                <div className="input-group">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder={t.itemName}
                    style={{ flex: 2 }}
                  />
                  <div className="input-separator" />
                  <input
                    type="number"
                    value={newItem.amount}
                    onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                    placeholder="0"
                    style={{ width: "80px" }}
                    className="amount-input"
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
                  <div key={item.itemId} className="item-row hover-glow">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-assigned">← {assignedTo}</span>
                    </div>
                    <div className="item-right">
                      <span className="amount">{item.amount}</span>
                      {session.status === "Draft" && (
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
        </div>

        <div className="stagger-3">
          <Section title={t.taxService} sectionKey="charges" icon={<Receipt size={18} />} count={session.charges.length} expandable isExpanded={expanded.charges} isAnimating={animatingSection === "charges"} onToggle={toggleSection}>
            {session.status === "Draft" && (
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
                <div key={c.chargeId} className="list-item hover-glow">
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
        </div>

        {session.status === "Draft" && session.participants.length > 0 && (
          <div className="stagger-4">
            <Section title={t.payments} sectionKey="payments" icon={<Banknote size={18} />} expandable isExpanded={expanded.payments} isAnimating={animatingSection === "payments"} onToggle={toggleSection}>
              <PaymentEditor
                participants={session.participants}
                onSubmit={replacePayments}
              />
            </Section>
          </div>
        )}

        {isCalculated && (
          <div className="stagger-4">
            <Section title="النتيجة" sectionKey="results" icon={<BarChart3 size={18} />} expandable isExpanded={expanded.results} isAnimating={animatingSection === "results"} onToggle={toggleSection}>
              <div className="results-list">
                {session.participants.map(p => {
                  const balance = parseFloat(p.balance);
                  return (
                    <div key={p.participantId} className={`result-card hover-glow ${balance > 0 ? "positive" : balance < 0 ? "negative" : "neutral"}`}>
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
          </div>
        )}

        {isCalculated && settlements.length > 0 && (
          <div className="stagger-5">
            <Section title="التسوية" sectionKey="settlements" icon={<ArrowRightLeft size={18} />} expandable isExpanded={expanded.settlements} isAnimating={animatingSection === "settlements"} onToggle={toggleSection}>
              <div className="settlements-list">
                {settlements.map((s, idx) => {
                  const fromName = session.participants.find(p => p.participantId === s.fromParticipantId)?.displayName || "";
                  const toName = session.participants.find(p => p.participantId === s.toParticipantId)?.displayName || "";
                  return (
                    <div key={idx} className="settlement-item hover-glow">
                      <span className="from">{fromName}</span>
                      <ArrowLeft size={16} className="owes-arrow" />
                      <span className="to">{toName}</span>
                      <span className="amount">{s.amount.toFixed(0)} {t.currency}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>
        )}

        {isCalculated && settlements.length === 0 && (
          <div className="all-settled">{t.noSettlements}</div>
        )}
      </div>

      <div className="action-area">
        {session.status === "Draft" && (
          <button className="calculate-btn" onClick={calculateSession}>
            الحسبة
          </button>
        )}

      </div>

      {toast && <div className="toast">{toast}</div>}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
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
    <div className="participant-item hover-glow">
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