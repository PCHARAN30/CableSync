import { useState, useEffect, forwardRef } from 'react';
import { customerFormSchema, normalizeCustomerPayload } from '../schemas/customerSchema';

const emptyForm = {
  name: '',
  phone: '',
  cafNumber: '',
  address: '',
  area: '',
  pon: '',
  monthlyFee: '',
};

function readPlans() {
  try {
    const raw = localStorage.getItem('cablesync_monthly_plans');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

const CustomerForm = forwardRef(function CustomerForm({ initialValues, onSubmit, submitLabel = 'Save', formId, hideSubmitButton = false }, ref) {
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState(() => readPlans());
  const [selectedPlanId, setSelectedPlanId] = useState('');

  useEffect(() => {
    const handler = () => setPlans(readPlans());
    window.addEventListener('cablesync:plans-updated', handler);
    return () => window.removeEventListener('cablesync:plans-updated', handler);
  }, []);

  useEffect(() => {
    // if initialValues has monthlyFee, keep it; otherwise clear selection
    if (initialValues?.monthlyFee) setForm((f) => ({ ...f, monthlyFee: initialValues.monthlyFee }));
  }, [initialValues]);

  function handleChange(field) {
    return (e) => {
      const val = e.target.value;
      setForm((f) => ({ ...f, [field]: val }));
      // Clear field error as user types
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    };
  }

  function handlePlanChange(e) {
    const id = e.target.value;
    setSelectedPlanId(id);
    if (fieldErrors.monthlyFee) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.monthlyFee;
        return next;
      });
    }
    if (!id) return setForm((f) => ({ ...f, monthlyFee: '' }));
    const plan = plans.find((p) => p.id === id);
    if (plan) setForm((f) => ({ ...f, monthlyFee: String(plan.amount) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate using Zod schema
    const validationResult = customerFormSchema.safeParse(form);
    if (!validationResult.success) {
      const errors = {};
      for (const issue of validationResult.error.issues) {
        const path = issue.path[0];
        if (path && !errors[path]) {
          errors[path] = issue.message;
        }
      }
      setFieldErrors(errors);
      setError('Please resolve the highlighted validation errors.');
      return;
    }

    const payload = normalizeCustomerPayload(validationResult.data);

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.map((e) => e.msg || e.message).join('; ')
          : null) ||
        err.message;

      setError(serverMessage || 'Could not save customer.');
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { key: 'name', label: 'Name', required: true, placeholder: 'Full Name' },
    { key: 'phone', label: 'Phone', required: true, type: 'tel', placeholder: '10-digit mobile number' },
    { key: 'cafNumber', label: 'CAF Number', required: true, placeholder: 'e.g. CAF100101' },
    { key: 'address', label: 'Address', placeholder: 'Door no., street, locality' },
    { key: 'area', label: 'Area', placeholder: 'e.g. Santhapet' },
    { key: 'pon', label: 'PON', placeholder: 'e.g. PN1001' },
  ];

  return (
    <form ref={ref} id={formId} data-saving={saving ? '1' : '0'} onSubmit={handleSubmit} className="customer-form-grid">
      {fields.map(({ key, label, required, type, placeholder }) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-ink-soft">
            {label} {required && <span className="text-due">*</span>}
          </span>
          <input
            type={type || 'text'}
            value={form[key]}
            placeholder={placeholder}
            onChange={handleChange(key)}
            className={`bg-paper border rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 ${
              fieldErrors[key]
                ? 'border-due focus:ring-due/30'
                : 'border-hairline focus:ring-brass/40 focus:border-brass'
            }`}
          />
          {fieldErrors[key] && (
            <span className="text-xs text-due font-medium">{fieldErrors[key]}</span>
          )}
        </label>
      ))}

      {/* Plan selector */}
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-soft">Saved Plan</span>
        <select
          value={selectedPlanId}
          onChange={handlePlanChange}
          className="bg-paper border border-hairline rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-brass/40 focus:border-brass"
        >
          <option value="">-- Custom / No plan --</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — ₹{Number(p.amount).toFixed(2)}</option>
          ))}
        </select>
      </label>

      {/* Monthly fee field (auto-filled from plan selection) */}
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-ink-soft">Monthly Fee (₹) <span className="text-due">*</span></span>
        <input
          type="number"
          min="1"
          step="any"
          placeholder="e.g. 370"
          value={form.monthlyFee}
          onChange={handleChange('monthlyFee')}
          className={`bg-paper border rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 ${
            fieldErrors.monthlyFee
              ? 'border-due focus:ring-due/30'
              : 'border-hairline focus:ring-brass/40 focus:border-brass'
          }`}
        />
        {fieldErrors.monthlyFee && (
          <span className="text-xs text-due font-medium">{fieldErrors.monthlyFee}</span>
        )}
        {form.monthlyFee !== '' && !fieldErrors.monthlyFee && !isNaN(Number(form.monthlyFee)) && Number(form.monthlyFee) > 0 && (
          <div className="text-sm text-ink-soft mt-1">Monthly amount: ₹{Number(form.monthlyFee).toFixed(2)}</div>
        )}
      </label>

      {error && <p className="text-due text-sm font-medium">{error}</p>}

      {!hideSubmitButton && (
        <button
          type="submit"
          disabled={saving}
          className="bg-brass text-white font-medium rounded-lg py-2.5 mt-2 hover:bg-brass-dark transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
      )}
    </form>
  );
});

export default CustomerForm;
