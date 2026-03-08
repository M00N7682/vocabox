"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
  CreditCard,
  Banknote,
  Building2,
  CircleDollarSign,
} from "lucide-react";
import {
  createPayment,
  createBulkPayments,
  updatePaymentStatus,
  deletePayment,
  generateReminderMessage,
} from "@/lib/actions/payments";
import type { PaymentWithStudent } from "@/lib/actions/payments";
import type { ClassWithStudents } from "@/lib/actions/classes";

type Student = {
  id: string;
  name: string;
  grade: string | null;
  school: string | null;
  parent_phone: string | null;
};

type Props = {
  payments: PaymentWithStudent[];
  summary: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    paidCount: number;
    totalCount: number;
  };
  classes: ClassWithStudents[];
  students: Student[];
  academyName: string;
  currentMonth: string;
  currentStatus: string;
};

export function PaymentsClient({
  payments,
  summary,
  classes,
  students,
  academyName,
  currentMonth,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);

  const formatMoney = (amount: number) => amount.toLocaleString("ko-KR");

  const changeMonth = (delta: number) => {
    const [y, m] = currentMonth.split("-").map(Number);
    const date = new Date(y, m - 1 + delta, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    router.push(
      `/payments?month=${newMonth}${currentStatus !== "all" ? `&status=${currentStatus}` : ""}`
    );
  };

  const changeStatus = (status: string) => {
    router.push(
      `/payments?month=${currentMonth}${status !== "all" ? `&status=${status}` : ""}`
    );
  };

  const handleStatusChange = (
    paymentId: string,
    status: "paid" | "pending" | "overdue" | "cancelled",
    method?: string
  ) => {
    startTransition(async () => {
      await updatePaymentStatus(paymentId, status, method);
      setStatusMenuId(null);
    });
  };

  const handleDelete = (paymentId: string) => {
    if (!confirm("이 수납 내역을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deletePayment(paymentId);
    });
  };

  const handleCopyReminder = async (payment: PaymentWithStudent) => {
    const msg = await generateReminderMessage(
      payment.students?.name || "",
      academyName,
      payment.description,
      payment.amount,
      payment.due_date
    );
    navigator.clipboard.writeText(msg);
    alert(
      "알림 메시지가 클립보드에 복사되었습니다.\n카카오톡이나 문자로 붙여넣기하세요."
    );
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return {
          text: "납부완료",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "pending":
        return {
          text: "미납",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "overdue":
        return {
          text: "연체",
          className: "bg-red-50 text-red-700 border-red-200",
        };
      case "cancelled":
        return {
          text: "취소",
          className: "bg-gray-50 text-gray-400 border-gray-200",
        };
      default:
        return {
          text: status,
          className: "bg-gray-50 text-gray-600 border-gray-200",
        };
    }
  };

  const methodLabel = (method: string | null) => {
    switch (method) {
      case "cash":
        return "현금";
      case "transfer":
        return "계좌이체";
      case "card":
        return "카드";
      case "auto":
        return "자동이체";
      case "other":
        return "기타";
      default:
        return "-";
    }
  };

  const statuses = [
    { key: "all", label: "전체" },
    { key: "pending", label: "미납" },
    { key: "paid", label: "납부완료" },
    { key: "overdue", label: "연체" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-eo-text-primary">수납 관리</h1>
          <p className="text-sm text-eo-text-secondary mt-1">
            학원비 수납 현황을 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setBulkDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-eo-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-4 h-4" />
            반별 일괄 등록
          </button>
          <button
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-eo-primary hover:bg-eo-primary-hover rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            수납 등록
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-lg font-bold text-eo-text-primary min-w-[120px] text-center">
          {currentMonth.replace("-", "년 ")}월
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          label="총 청구액"
          value={formatMoney(summary.total)}
          sub={`${summary.totalCount}건`}
          color="indigo"
        />
        <SummaryCard
          label="수납 완료"
          value={formatMoney(summary.paid)}
          sub={`${summary.paidCount}건`}
          color="emerald"
        />
        <SummaryCard
          label="미납"
          value={formatMoney(summary.pending)}
          color="amber"
        />
        <SummaryCard
          label="연체"
          value={formatMoney(summary.overdue)}
          color="red"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {statuses.map((s) => (
          <button
            key={s.key}
            onClick={() => changeStatus(s.key)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              currentStatus === s.key
                ? "bg-white text-eo-text-primary font-semibold shadow-sm"
                : "text-eo-text-secondary hover:text-eo-text-primary"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-eo-border bg-gray-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-eo-text-secondary">
                학생
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-eo-text-secondary">
                항목
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-eo-text-secondary">
                금액
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-eo-text-secondary">
                납부기한
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-eo-text-secondary">
                상태
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-eo-text-secondary">
                수납방법
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-eo-text-secondary">
                액션
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-sm text-eo-text-tertiary"
                >
                  이 달의 수납 내역이 없습니다.
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const st = statusLabel(p.status);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-eo-border last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-eo-text-primary">
                        {p.students?.name}
                      </p>
                      <p className="text-xs text-eo-text-tertiary">
                        {p.students?.grade} {p.students?.school || ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-eo-text-primary">
                        {p.description}
                      </p>
                      {p.memo && (
                        <p className="text-xs text-eo-text-tertiary">
                          {p.memo}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-eo-text-primary">
                        {formatMoney(p.amount)}원
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-eo-text-secondary">
                        {p.due_date}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() =>
                          setStatusMenuId(
                            statusMenuId === p.id ? null : p.id
                          )
                        }
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border ${st.className} cursor-pointer hover:opacity-80`}
                      >
                        {st.text}
                      </button>
                      {statusMenuId === p.id && (
                        <div className="absolute z-10 mt-1 right-0 bg-white border border-eo-border rounded-lg shadow-lg py-1 min-w-[160px]">
                          <button
                            onClick={() =>
                              handleStatusChange(p.id, "paid", "transfer")
                            }
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            계좌이체 완료
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(p.id, "paid", "cash")
                            }
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Banknote className="w-3.5 h-3.5 text-gray-400" />
                            현금 완료
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(p.id, "paid", "card")
                            }
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                            카드 완료
                          </button>
                          <div className="border-t border-eo-border my-1" />
                          <button
                            onClick={() =>
                              handleStatusChange(p.id, "pending")
                            }
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <CircleDollarSign className="w-3.5 h-3.5 text-amber-400" />
                            미납으로 변경
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(p.id, "overdue")
                            }
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <X className="w-3.5 h-3.5 text-red-400" />
                            연체로 변경
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-eo-text-tertiary">
                        {methodLabel(p.payment_method)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleCopyReminder(p)}
                          title="알림 문자 복사"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-eo-text-tertiary hover:text-eo-text-secondary"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          title="삭제"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-eo-text-tertiary hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Payment Dialog */}
      {addDialogOpen && (
        <Dialog onClose={() => setAddDialogOpen(false)} title="수납 등록">
          <form
            action={(formData) => {
              startTransition(async () => {
                const result = await createPayment(formData);
                if (result.success) setAddDialogOpen(false);
                else if (result.error) alert(result.error);
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                학생
              </label>
              <select
                name="student_id"
                required
                className="w-full border border-eo-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">학생 선택</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.grade || ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                항목
              </label>
              <input
                name="description"
                required
                placeholder="예: 3월 수업료"
                className="w-full border border-eo-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  금액 (원)
                </label>
                <input
                  name="amount"
                  type="number"
                  required
                  placeholder="300000"
                  className="w-full border border-eo-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  납부기한
                </label>
                <input
                  name="due_date"
                  type="date"
                  required
                  className="w-full border border-eo-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모 (선택)
              </label>
              <input
                name="memo"
                placeholder="메모"
                className="w-full border border-eo-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddDialogOpen(false)}
                className="px-4 py-2 text-sm border border-eo-border rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm text-white bg-eo-primary hover:bg-eo-primary-hover rounded-lg disabled:opacity-50"
              >
                {isPending ? "등록 중..." : "등록"}
              </button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Bulk Payment Dialog */}
      {bulkDialogOpen && (
        <Dialog
          onClose={() => setBulkDialogOpen(false)}
          title="반별 일괄 등록"
        >
          <form
            action={(formData) => {
              const classId = formData.get("class_id") as string;
              startTransition(async () => {
                const result = await createBulkPayments(classId, formData);
                if (result.success) {
                  alert(`${result.count}명에게 수납이 등록되었습니다.`);
                  setBulkDialogOpen(false);
                } else if (result.error) {
                  alert(result.error);
                }
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                반 선택
              </label>
              <select
                name="class_id"
                required
                className="w-full border border-eo-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">반 선택</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.class_students.length}명)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                항목
              </label>
              <input
                name="description"
                required
                placeholder="예: 3월 수업료"
                className="w-full border border-eo-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  금액 (원)
                </label>
                <input
                  name="amount"
                  type="number"
                  required
                  placeholder="300000"
                  className="w-full border border-eo-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  납부기한
                </label>
                <input
                  name="due_date"
                  type="date"
                  required
                  className="w-full border border-eo-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모 (선택)
              </label>
              <input
                name="memo"
                placeholder="메모"
                className="w-full border border-eo-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkDialogOpen(false)}
                className="px-4 py-2 text-sm border border-eo-border rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm text-white bg-eo-primary hover:bg-eo-primary-hover rounded-lg disabled:opacity-50"
              >
                {isPending ? "등록 중..." : "일괄 등록"}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: "border-l-indigo-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
    red: "border-l-red-500",
  };

  return (
    <div
      className={`bg-white rounded-xl border border-eo-border border-l-4 ${colorMap[color]} p-4`}
    >
      <p className="text-xs text-eo-text-secondary font-medium">{label}</p>
      <p className="text-xl font-bold text-eo-text-primary mt-1">{value}원</p>
      {sub && <p className="text-xs text-eo-text-tertiary mt-0.5">{sub}</p>}
    </div>
  );
}

function Dialog({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-eo-text-primary mb-4">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
