import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Search,
  Filter,
  CreditCard,
  Building2,
  Calendar,
  PlusCircle,
  FileCheck,
  Receipt,
  QrCode,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  ArrowUpRight,
  PieChart
} from 'lucide-react';
import {
  StudentFeeAccount,
  FeeTransactionReceipt,
  PaymentMethod,
  StudentRecord
} from '../types';

interface FeeManagementSuiteProps {
  feeAccounts: StudentFeeAccount[];
  receipts: FeeTransactionReceipt[];
  students: StudentRecord[];
  onCollectFee: (receipt: FeeTransactionReceipt, updatedAccount: StudentFeeAccount) => void;
  preselectedStudentId?: string | null;
}

export const FeeManagementSuite: React.FC<FeeManagementSuiteProps> = ({
  feeAccounts,
  receipts,
  students,
  onCollectFee,
  preselectedStudentId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'Accounts' | 'Receipts' | 'Analytics'>(
    'Accounts'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedAccountForPayment, setSelectedAccountForPayment] = useState<StudentFeeAccount | null>(
    preselectedStudentId
      ? feeAccounts.find((a) => a.studentId === preselectedStudentId) || null
      : null
  );
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<FeeTransactionReceipt | null>(
    null
  );

  // Payment Form States
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [txnRef, setTxnRef] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState<string>('Finance Officer Desk');
  const [payRemarks, setPayRemarks] = useState<string>('');
  const [includeLateFee, setIncludeLateFee] = useState<boolean>(true);

  // Financial Analytics KPIs
  const totalAssessedSum = feeAccounts.reduce((acc, f) => acc + f.netPayable, 0);
  const totalCollectedSum = feeAccounts.reduce((acc, f) => acc + f.amountPaid, 0);
  const totalOutstandingSum = feeAccounts.reduce((acc, f) => acc + f.outstandingBalance, 0);
  const totalLateFeeAccrued = feeAccounts.reduce((acc, f) => acc + f.calculatedLateFee, 0);
  const collectionPercentage =
    totalAssessedSum > 0 ? ((totalCollectedSum / totalAssessedSum) * 100).toFixed(1) : '0';

  const filteredAccounts = feeAccounts.filter((acc) => {
    const matchesSearch =
      acc.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.programName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || acc.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredReceipts = receipts.filter((rcp) => {
    return (
      rcp.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rcp.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rcp.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rcp.transactionReference.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenPayment = (account: StudentFeeAccount) => {
    setSelectedAccountForPayment(account);
    const balanceWithLateFee = account.outstandingBalance;
    setPayAmount(balanceWithLateFee);
    setTxnRef(`TXN-${Date.now().toString().slice(-6)}`);
    setPayRemarks(`Fee settlement for ${account.termLabel}`);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForPayment || payAmount <= 0) return;

    const lateFeeCharge =
      includeLateFee && selectedAccountForPayment.calculatedLateFee > 0
        ? selectedAccountForPayment.calculatedLateFee
        : 0;

    const totalTransaction = Number(payAmount) + Number(lateFeeCharge);
    const newPaidAmount = selectedAccountForPayment.amountPaid + Number(payAmount);
    const newOutstanding = Math.max(0, selectedAccountForPayment.netPayable - newPaidAmount);

    let newStatus: StudentFeeAccount['paymentStatus'] = 'Paid';
    if (newOutstanding > 0) {
      newStatus = 'Partial';
    }

    const updatedAccount: StudentFeeAccount = {
      ...selectedAccountForPayment,
      amountPaid: newPaidAmount,
      outstandingBalance: newOutstanding,
      paymentStatus: newStatus,
      calculatedLateFee: includeLateFee ? 0 : selectedAccountForPayment.calculatedLateFee,
      lastPaymentDate: new Date().toISOString().split('T')[0],
    };

    const newReceipt: FeeTransactionReceipt = {
      id: `rcp-${Date.now()}`,
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      feeAccountId: selectedAccountForPayment.id,
      studentId: selectedAccountForPayment.studentId,
      enrollmentNo: selectedAccountForPayment.enrollmentNo,
      studentName: selectedAccountForPayment.studentName,
      programName: selectedAccountForPayment.programName,
      termLabel: selectedAccountForPayment.termLabel,
      amountPaid: Number(payAmount),
      lateFeePaid: Number(lateFeeCharge),
      totalTransactionAmount: totalTransaction,
      paymentMethod: payMethod,
      transactionReference: txnRef || `REF-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      receivedByStaff: receivedBy,
      remarks: payRemarks,
      status: 'Successful',
    };

    onCollectFee(newReceipt, updatedAccount);
    setSelectedAccountForPayment(null);
    setSelectedReceiptForPrint(newReceipt);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Revenue Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Fee Management Suite & Billing Hub
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  INR (₹) Standard
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Student-wise fee structures, live installment tracking, automated late-fee calculation, and instant verified receipts
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('Accounts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'Accounts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fee Accounts ({feeAccounts.length})
            </button>
            <button
              onClick={() => setActiveSubTab('Receipts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'Receipts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Receipts Ledger ({receipts.length})
            </button>
            <button
              onClick={() => setActiveSubTab('Analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'Analytics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Revenue Analytics
            </button>
          </div>
        </div>

        {/* 4 Financial Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Total Assessed Fees</p>
            <p className="text-2xl font-bold text-white mt-1">₹{totalAssessedSum.toLocaleString('en-IN')}</p>
            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              Net of concessions
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Total Collected</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              ₹{totalCollectedSum.toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-emerald-400/90 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> {collectionPercentage}% Realized
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Outstanding Balance</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">
              ₹{totalOutstandingSum.toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-rose-400/90 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> Due Across Programs
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Calculated Late Fees</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              ₹{totalLateFeeAccrued.toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-amber-400/90 flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3 h-3" /> Automated Grace Period Policy
            </span>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: ACCOUNTS LIST */}
      {activeSubTab === 'Accounts' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, enrollment no, or program..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Fee Status</option>
                  <option value="Paid">Paid in Full</option>
                  <option value="Partial">Partial Payment</option>
                  <option value="Pending">Pending Notice</option>
                  <option value="Overdue">Overdue with Late Fee</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((account) => {
              const isOverdue = account.paymentStatus === 'Overdue';
              const isPaid = account.paymentStatus === 'Paid';

              return (
                <div
                  key={account.id}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition hover:border-slate-700 ${
                    isOverdue
                      ? 'border-rose-900/40 bg-gradient-to-b from-rose-950/10 to-slate-900'
                      : isPaid
                      ? 'border-emerald-900/30'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-white text-base leading-snug">
                          {account.studentName}
                        </h4>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {account.enrollmentNo}
                          </span>
                          <span>•</span>
                          <span>{account.termLabel}</span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          account.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : account.paymentStatus === 'Partial'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : account.paymentStatus === 'Overdue'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                        }`}
                      >
                        {account.paymentStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-1">{account.programName}</p>

                    {/* Fee Heads breakdown preview */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Net Assessed Fee:</span>
                        <span className="text-slate-200 font-medium">
                          ₹{account.netPayable.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Amount Paid:</span>
                        <span className="text-emerald-400 font-medium">
                          ₹{account.amountPaid.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Outstanding Due:</span>
                        <span
                          className={`font-semibold ${
                            account.outstandingBalance > 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          ₹{account.outstandingBalance.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {account.calculatedLateFee > 0 && (
                        <div className="flex justify-between text-amber-400 font-semibold bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Accrued Late Fee:
                          </span>
                          <span>+ ₹{account.calculatedLateFee.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {account.dueDate}</span>
                    </div>

                    {account.outstandingBalance > 0 ? (
                      <button
                        onClick={() => handleOpenPayment(account)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Collect Payment</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fully Cleared
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RECEIPTS LEDGER */}
      {activeSubTab === 'Receipts' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search receipts by ID, student, or transaction UTR..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div className="text-xs text-slate-400">
              Total {filteredReceipts.length} verified receipts issued
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Receipt Number</th>
                    <th className="py-3.5 px-4 font-semibold">Student & Program</th>
                    <th className="py-3.5 px-4 font-semibold">Payment Mode</th>
                    <th className="py-3.5 px-4 font-semibold">Transaction Ref / UTR</th>
                    <th className="py-3.5 px-4 font-semibold">Total Paid</th>
                    <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Receipt Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredReceipts.map((rcp) => (
                    <tr key={rcp.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-400">{rcp.receiptNumber}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{rcp.studentName}</div>
                        <div className="text-xs text-slate-400">
                          {rcp.enrollmentNo} • {rcp.termLabel}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-medium text-slate-200">
                          <Smartphone className="w-3 h-3 text-cyan-400" />
                          {rcp.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        {rcp.transactionReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-400 text-sm">
                          ₹{rcp.totalTransactionAmount.toLocaleString('en-IN')}
                        </span>
                        {rcp.lateFeePaid > 0 && (
                          <div className="text-[10px] text-amber-400">
                            (incl. ₹{rcp.lateFeePaid} late fee)
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">{rcp.paymentDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceiptForPrint(rcp)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print / View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REVENUE ANALYTICS */}
      {activeSubTab === 'Analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fee Heads Realization Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-blue-400" />
                Fee Head Composition & Assessment
              </h3>
              <div className="space-y-3.5">
                {[
                  { head: 'Tuition Fees', percentage: 65, color: 'bg-blue-500' },
                  { head: 'Laboratory & Consumables', percentage: 18, color: 'bg-emerald-500' },
                  { head: 'Hostel & Mess Facilities', percentage: 9, color: 'bg-purple-500' },
                  { head: 'Examination & Evaluation', percentage: 4, color: 'bg-amber-500' },
                  { head: 'Library, Sports & Development', percentage: 4, color: 'bg-cyan-500' },
                ].map((item) => (
                  <div key={item.head} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.head}</span>
                      <span className="text-slate-400 font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Digital Payment Gateways & Settlement Split
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Instant UPI (BHIM/GPay/PhonePe)</div>
                      <div className="text-xs text-slate-400">Zero MDR institutional gateway</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">48% of volume</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Net Banking / NEFT / RTGS</div>
                      <div className="text-xs text-slate-400">High-value tuition transfers</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-blue-400">32% of volume</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Debit / Credit Card POS</div>
                      <div className="text-xs text-slate-400">Campus administrative counter</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-purple-400">14% of volume</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Bank Demand Draft / Cheque</div>
                      <div className="text-xs text-slate-400">Scholarship / Trust endowments</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-400">6% of volume</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLLECT PAYMENT MODAL */}
      {selectedAccountForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Collect Student Fee Payment</h3>
              </div>
              <button
                onClick={() => setSelectedAccountForPayment(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold text-white">
                    {selectedAccountForPayment.studentName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {selectedAccountForPayment.enrollmentNo} • {selectedAccountForPayment.termLabel}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Outstanding Due</span>
                  <span className="text-lg font-bold text-rose-400">
                    ₹{selectedAccountForPayment.outstandingBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {selectedAccountForPayment.calculatedLateFee > 0 && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Automated Late Fee (Overdue since {selectedAccountForPayment.dueDate}):
                  </span>
                  <span className="font-bold">
                    + ₹{selectedAccountForPayment.calculatedLateFee.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Amount to Collect (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedAccountForPayment.outstandingBalance}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Payment Method *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="UPI">UPI (BHIM, GooglePay, PhonePe)</option>
                    <option value="Net Banking">Net Banking / NEFT / RTGS</option>
                    <option value="Credit/Debit Card">Credit / Debit Card (POS)</option>
                    <option value="Demand Draft / Cheque">Demand Draft / Bank Cheque</option>
                    <option value="Cash / POS">Cash Counter Slip</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Transaction Reference / UTR *
                  </label>
                  <input
                    type="text"
                    required
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    placeholder="e.g. UPI/624100912"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Received by Staff</label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-300 font-medium block mb-1">Remarks / Note</label>
                  <input
                    type="text"
                    value={payRemarks}
                    onChange={(e) => setPayRemarks(e.target.value)}
                    placeholder="e.g. Sessional term fee installment"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {selectedAccountForPayment.calculatedLateFee > 0 && (
                <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    id="includeLateFee"
                    checked={includeLateFee}
                    onChange={(e) => setIncludeLateFee(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="includeLateFee" className="text-slate-300 cursor-pointer">
                    Collect and clear late fee surcharge (₹{selectedAccountForPayment.calculatedLateFee})
                  </label>
                </div>
              )}

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex justify-between items-center">
                <span>Total Realized in this transaction:</span>
                <span className="font-bold text-base text-white">
                  ₹
                  {(
                    Number(payAmount) +
                    (includeLateFee ? selectedAccountForPayment.calculatedLateFee : 0)
                  ).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAccountForPayment(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Generate Official Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Institutional Fee Receipt
              </span>
              <button
                onClick={() => setSelectedReceiptForPrint(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Printable Receipt Card */}
            <div
              id="printable-receipt"
              className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-md space-y-4"
            >
              {/* Receipt Header */}
              <div className="border-b border-slate-200 pb-4 text-center">
                <div className="font-bold text-lg text-slate-900 uppercase tracking-wide">
                  PharmMed Institute of Higher Learning & Research
                </div>
                <div className="text-xs text-slate-600">
                  Approved by PCI, NMC, AICTE • NAAC A++ (CGPA 3.82) • ISO 21001:2025 Certified
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Institutional Campus, Knowledge Park IV, Greater Tech City - 201308
                </div>
                <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 rounded border border-slate-300 text-xs font-bold text-slate-800">
                  STUDENT FEE RECEIPT
                </div>
              </div>

              {/* Receipt Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Receipt No: </span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedReceiptForPrint.receiptNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Date: </span>
                  <span className="font-medium text-slate-900">
                    {selectedReceiptForPrint.paymentDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Student Name: </span>
                  <span className="font-bold text-slate-900">
                    {selectedReceiptForPrint.studentName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Enrollment No: </span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedReceiptForPrint.enrollmentNo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Program: </span>
                  <span className="text-slate-800">{selectedReceiptForPrint.programName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Term: </span>
                  <span className="text-slate-800">{selectedReceiptForPrint.termLabel}</span>
                </div>
              </div>

              {/* Table of Heads */}
              <table className="w-full text-xs text-left border-t border-b border-slate-200 py-2">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2">Description / Component</th>
                    <th className="py-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 text-slate-800">
                      Term Fee Installment ({selectedReceiptForPrint.termLabel})
                    </td>
                    <td className="py-2 text-right font-medium text-slate-900">
                      ₹{selectedReceiptForPrint.amountPaid.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  {selectedReceiptForPrint.lateFeePaid > 0 && (
                    <tr>
                      <td className="py-2 text-rose-700">Late Fee Charge (Overdue Surcharge)</td>
                      <td className="py-2 text-right font-medium text-rose-700">
                        ₹{selectedReceiptForPrint.lateFeePaid.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                  <tr className="font-bold text-sm bg-slate-50">
                    <td className="py-2.5 px-1 text-slate-900">Total Amount Received</td>
                    <td className="py-2.5 px-1 text-right text-emerald-700">
                      ₹{selectedReceiptForPrint.totalTransactionAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span>Payment Mode: </span>
                  <strong className="text-slate-900">{selectedReceiptForPrint.paymentMethod}</strong>
                </div>
                <div className="text-right">
                  <span>Txn Ref: </span>
                  <strong className="font-mono text-slate-900">
                    {selectedReceiptForPrint.transactionReference}
                  </strong>
                </div>
                <div className="col-span-2">
                  <span>Authorized Staff Signatory: </span>
                  <span className="text-slate-900 font-medium">
                    {selectedReceiptForPrint.receivedByStaff}
                  </span>
                </div>
              </div>

              {/* Verification Stamp & QR Mock */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Digitally Generated & Verified via Institutional ERP Cloud Ledger</span>
                </div>
                <div className="font-semibold text-slate-700">ACCOUNTS OFFICER / CASHIER</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => setSelectedReceiptForPrint(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
