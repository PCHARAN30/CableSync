import { useEffect, useState } from "react";
import { Moon, RefreshCw, Plus, Trash2, UserRound, Phone, Mail, Clock, Save } from "lucide-react";
import api from "../services/api";
import { useToasts } from "../hooks/useToasts";
import TopBar from "../components/TopBar";
import "../components/UtilityPanel.css";

function readPlans() {
  try {
    const raw = localStorage.getItem("cablesync_monthly_plans");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writePlans(plans) {
  localStorage.setItem("cablesync_monthly_plans", JSON.stringify(plans));
  window.dispatchEvent(new Event("cablesync:plans-updated"));
}

export default function Settings() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [plans, setPlans] = useState(() => readPlans());
  const [planName, setPlanName] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [operator, setOperator] = useState({
    name: "", supportPhone: "", supportEmail: "", officeHours: "", emergencyHelpline: "",
    paymentUpiId: "", paymentDisplayName: "",
  });
  const { addToast } = useToasts();

  useEffect(() => {
    const storedTheme = localStorage.getItem("cablesync_theme");
    const dark = storedTheme === "dark";
    setIsDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("dark-mode", dark);
    document.body.classList.toggle("dark", dark);
    document.body.classList.toggle("dark-mode", dark);
  }, []);

  useEffect(() => {
    api.get("/operator").then((response) => {
      if (response.data?.data) setOperator(response.data.data);
    }).catch(() => {});
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    document.documentElement.classList.toggle("dark-mode", nextDark);
    document.body.classList.toggle("dark", nextDark);
    document.body.classList.toggle("dark-mode", nextDark);
    localStorage.setItem("cablesync_theme", nextDark ? "dark" : "light");
    addToast(nextDark ? "Eye Protect dark mode enabled" : "Crisp light theme enabled", "success");
  };

  const handleReset = async () => {
    setIsBusy(true);
    try {
      const response = await api.post("/customers/reset");
      addToast(response.data.message || "Demo customers restored", "success");
      setShowConfirm(false);
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to reset customers", "error");
    } finally {
      setIsBusy(false);
    }
  };

  function handleAddPlan() {
    if (!planName || !planAmount) return addToast("Enter name and amount", "error");
    const amount = Number(planAmount);
    if (Number.isNaN(amount) || amount < 0) return addToast("Enter valid amount", "error");
    const newPlan = { id: Date.now().toString(), name: planName.trim(), amount };
    const next = [...plans, newPlan];
    setPlans(next);
    writePlans(next);
    setPlanName("");
    setPlanAmount("");
    addToast("Plan saved", "success");
  }

  function handleDeletePlan(id) {
    const next = plans.filter((p) => p.id !== id);
    setPlans(next);
    writePlans(next);
    addToast("Plan removed", "success");
  }

  async function handleSaveOperator(e) {
    e.preventDefault();
    try {
      const response = await api.put("/operator", operator);
      setOperator(response.data.data);
      addToast("Operator details saved", "success");
    } catch (error) {
      addToast(error.response?.data?.message || "Could not save operator details", "error");
    }
  }

  return (
    <div className="app-page">
      <TopBar title="Settings & Utilities" backTo="/customers" />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-brass-dark">Workspace</p>
          <h2 className="font-display text-3xl font-semibold text-ink">Settings & Utilities</h2>
          <p className="mt-1 text-sm text-ink-soft">Toggle theme, factory reset demo data and manage monthly plans.</p>
        </div>

        <div className="rounded-2xl border border-hairline bg-card p-6 shadow-ledger">
          <div className="utility-panel-section">
            <div className="utility-panel-row">
              <div className="utility-panel-row-icon">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <p className="utility-panel-row-label">Dark Mode</p>
                <p className="utility-panel-row-subtitle">Toggle theme</p>
              </div>
              <button
                type="button"
                className={`theme-toggle ${isDarkMode ? "enabled" : "disabled"}`}
                onClick={handleToggleTheme}
              >
                <span className="theme-toggle-knob" />
              </button>
            </div>
          </div>

          <div className="utility-panel-divider" />

          <div className="utility-panel-section">
            <div className="utility-panel-row">
              <div className="utility-panel-row-icon">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="utility-panel-row-label">Factory Reset</p>
                <p className="utility-panel-row-subtitle">Restore demo customers</p>
              </div>
            </div>
            <button
              type="button"
              className="utility-panel-action"
              onClick={() => setShowConfirm(true)}
            >
              Reset Customers
            </button>

            {showConfirm && (
              <div className="utility-panel-confirm">
                <p className="utility-panel-confirm-title">⚠ Factory Reset</p>
                <p className="utility-panel-confirm-copy">This will:</p>
                <ul className="utility-panel-confirm-list">
                  <li>• Delete all payments</li>
                  <li>• Restore original customers</li>
                  <li>• Restore original billing</li>
                </ul>
                <div className="utility-panel-confirm-actions">
                  <button
                    type="button"
                    className="utility-panel-cancel"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="utility-panel-reset"
                    onClick={handleReset}
                    disabled={isBusy}
                  >
                    {isBusy ? "Resetting…" : "Reset"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="utility-panel-divider" />

          <form className="utility-plan-section" onSubmit={handleSaveOperator}>
            <p className="utility-panel-title">Operator Details</p>
            <p className="utility-panel-row-subtitle">Shown on the customer support portal.</p>
            <label className="sr-only" htmlFor="operator-name">Operator name</label>
            <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-brass" /><input id="operator-name" value={operator.name} onChange={(e) => setOperator({ ...operator, name: e.target.value })} placeholder="Operator name…" className="plan-input flex-1" /></div>
            <label className="sr-only" htmlFor="operator-phone">Support phone</label>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-brass" /><input id="operator-phone" type="tel" value={operator.supportPhone} onChange={(e) => setOperator({ ...operator, supportPhone: e.target.value })} placeholder="Support phone…" className="plan-input flex-1" /></div>
            <label className="sr-only" htmlFor="operator-email">Support email</label>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-brass" /><input id="operator-email" type="email" value={operator.supportEmail} onChange={(e) => setOperator({ ...operator, supportEmail: e.target.value })} placeholder="Support email…" className="plan-input flex-1" /></div>
            <label className="sr-only" htmlFor="operator-hours">Office hours</label>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-brass" /><input id="operator-hours" value={operator.officeHours} onChange={(e) => setOperator({ ...operator, officeHours: e.target.value })} placeholder="Office hours…" className="plan-input flex-1" /></div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">Payment Details</p>
            <label className="sr-only" htmlFor="payment-upi-id">UPI ID</label>
            <div className="flex items-center gap-2"><span className="w-4 text-center text-xs font-bold text-brass">₹</span><input id="payment-upi-id" value={operator.paymentUpiId} onChange={(e) => setOperator({ ...operator, paymentUpiId: e.target.value })} placeholder="UPI ID…" className="plan-input flex-1" /></div>
            <label className="sr-only" htmlFor="payment-display-name">UPI display name</label>
            <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-brass" /><input id="payment-display-name" value={operator.paymentDisplayName} onChange={(e) => setOperator({ ...operator, paymentDisplayName: e.target.value })} placeholder="UPI display name…" className="plan-input flex-1" /></div>
            <button type="submit" className="utility-panel-action"><Save className="mr-2 inline h-4 w-4" /> Save Operator Details</button>
          </form>

          <div className="utility-panel-divider" />

          <div className="utility-plan-section">
            <p className="utility-panel-title">Monthly Plans</p>
            <p className="utility-panel-row-subtitle">Create and manage saved monthly plans</p>

            <div className="utility-plan-form">
              <input
                type="text"
                placeholder="Plan name (e.g., Basic)"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="plan-input"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={planAmount}
                onChange={(e) => setPlanAmount(e.target.value)}
                className="plan-input"
              />
              <button type="button" className="utility-panel-action" onClick={handleAddPlan}>
                <Plus className="h-4 w-4 inline -mt-0.5 mr-2" /> Save Plan
              </button>
            </div>

            <div className="utility-plan-list">
              {plans.length === 0 && <p className="muted">No saved plans</p>}
              {plans.map((p) => (
                <div key={p.id} className="utility-plan-item">
                  <div>
                    <div className="utility-plan-name">{p.name}</div>
                    <div className="utility-plan-amount">₹{p.amount.toFixed(2)}</div>
                  </div>
                  <button type="button" className="utility-plan-delete" onClick={() => handleDeletePlan(p.id)} aria-label="Delete plan">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
