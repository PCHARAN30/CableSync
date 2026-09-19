import { Printer, Share2, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*CableSync Digital Receipt #${receipt.receiptNumber}*\nSubscriber: ${receipt.customerName} (${receipt.cafNumber})\nAmount Paid: ₹${receipt.amount}\nMode: ${receipt.paymentMode}\nDate: ${formatDate(receipt.paymentDate)}\nValid Through: ${formatDate(receipt.resultingPaidThrough)}\nBalance Due: ₹${receipt.remainingDue || 0}\n\nThank you for choosing CableSync!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-hairline bg-card shadow-2xl">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-hairline bg-paper/60 px-5 py-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Digital Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-paper transition-colors"
              title="Print Receipt"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 rounded-lg text-ink-soft hover:text-emerald-600 hover:bg-paper transition-colors"
              title="Share on WhatsApp"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-paper transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-7 text-ink" id="printable-receipt">
          {/* Operator Header */}
          <div className="border-b border-dashed border-hairline pb-4 text-center">
            <h2 className="font-display text-lg font-bold text-ink">
              {receipt.operatorName || 'CableSync Prime Network'}
            </h2>
            <p className="text-xs text-ink-soft">Authorized Cable TV & High-Speed Broadband Provider</p>
            <p className="text-[11px] font-mono text-ink-soft mt-0.5">
              GSTIN: {receipt.operatorGst || '37AABCC1234D1ZX'} • Support: {receipt.supportPhone || '+91 98765 43210'}
            </p>
          </div>

          {/* Receipt Meta */}
          <div className="mt-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] text-ink-soft uppercase font-medium">Receipt No.</span>
              <p className="font-mono font-bold text-ink">CS-REC-{receipt.receiptNumber}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-ink-soft uppercase font-medium">Payment Date</span>
              <p className="font-mono font-medium text-ink">{formatDate(receipt.paymentDate)}</p>
            </div>
          </div>

          {/* Subscriber Info Box */}
          <div className="mt-4 rounded-xl border border-hairline bg-paper/50 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-ink-soft">Subscriber Name:</span>
              <span className="font-semibold text-ink">{receipt.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">CAF Number:</span>
              <span className="font-mono font-semibold text-ink">{receipt.cafNumber}</span>
            </div>
            {receipt.phone && (
              <div className="flex justify-between">
                <span className="text-ink-soft">Registered Mobile:</span>
                <span className="font-mono text-ink">{receipt.phone}</span>
              </div>
            )}
            {receipt.address && (
              <div className="flex justify-between text-[11px]">
                <span className="text-ink-soft">Installation Address:</span>
                <span className="text-ink text-right max-w-[220px] truncate">{receipt.address}</span>
              </div>
            )}
          </div>

          {/* Ledger Settlement Breakdown */}
          <div className="mt-4 border-t border-hairline pt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-hairline text-ink-soft text-[11px]">
                  <th className="text-left pb-1.5 font-medium">Description</th>
                  <th className="text-right pb-1.5 font-medium">Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/60 font-mono">
                <tr>
                  <td className="py-1.5 text-ink">Settlement of Past Arrears</td>
                  <td className="py-1.5 text-right font-medium">
                    {formatCurrency(receipt.allocatedToArrears || 0)}
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 text-ink">Advance Renewal Credit</td>
                  <td className="py-1.5 text-right font-medium">
                    {formatCurrency(receipt.allocatedToAdvance || 0)}
                  </td>
                </tr>
                <tr className="border-t border-hairline font-bold text-sm">
                  <td className="pt-2 text-ink font-sans">Total Amount Paid</td>
                  <td className="pt-2 text-right text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(receipt.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Validity & Balance Footer */}
          <div className="mt-4 rounded-xl border border-emerald-600/20 bg-emerald-500/[0.04] p-3 text-xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-medium text-ink">Paid Through Validity:</span>
              <span className="font-mono font-bold text-paid">
                {receipt.resultingPaidThrough ? formatDate(receipt.resultingPaidThrough) : 'Active Cycle'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-soft">Remaining Balance Due:</span>
              <span className="font-mono font-medium text-ink">
                {formatCurrency(receipt.remainingDue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-emerald-600/10 text-ink-soft">
              <span>Payment Mode:</span>
              <span className="font-semibold text-ink">{receipt.paymentMode || 'Online'}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-[11px] text-ink-soft pt-2 border-t border-dashed border-hairline">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Computer generated receipt</span>
            </div>
            <span>No signature required</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-hairline bg-paper/60 px-6 py-3">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="rounded-xl border border-hairline bg-card px-3.5 py-2 text-xs font-semibold text-ink hover:bg-paper transition-all flex items-center gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-600" /> Share WhatsApp
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-ink/90 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
