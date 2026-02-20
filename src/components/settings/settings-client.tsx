"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Users,
  Bell,
  CreditCard,
  Shield,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { updateAcademyInfo } from "@/lib/actions/settings";
import type { Academy, Profile } from "@/types/database";

const settingsNav = [
  { id: "academy", label: "학원 정보", icon: Building2 },
  { id: "teachers", label: "강사 관리", icon: Users },
  { id: "notifications", label: "알림 설정", icon: Bell },
  { id: "billing", label: "구독/결제", icon: CreditCard },
  { id: "security", label: "보안", icon: Shield },
] as const;

type TabId = (typeof settingsNav)[number]["id"];

interface SettingsClientProps {
  academy: Academy | null;
  teachers: Profile[];
}

export function SettingsClient({ academy, teachers }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("academy");

  return (
    <div className="flex gap-6 p-8">
      {/* Settings Nav */}
      <div className="w-[220px] shrink-0 bg-white rounded-xl border border-eo-border py-4">
        {settingsNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-eo-primary-light text-eo-primary font-semibold border-l-[3px] border-eo-primary"
                  : "text-eo-text-secondary hover:bg-eo-bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Settings Content */}
      <div className="flex-1 flex flex-col gap-6">
        {activeTab === "academy" && (
          <AcademyInfoCard academy={academy} />
        )}
        {activeTab === "teachers" && (
          <TeacherListCard teachers={teachers} />
        )}
        {activeTab !== "academy" && activeTab !== "teachers" && (
          <PlaceholderCard
            label={settingsNav.find((n) => n.id === activeTab)?.label ?? ""}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Academy Info Card                                                  */
/* ------------------------------------------------------------------ */

function AcademyInfoCard({ academy }: { academy: Academy | null }) {
  const [name, setName] = useState(academy?.name ?? "");
  const [phone, setPhone] = useState(academy?.phone ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const originalName = academy?.name ?? "";
  const originalPhone = academy?.phone ?? "";

  const isDirty = name !== originalName || phone !== originalPhone;

  function handleCancel() {
    setName(originalName);
    setPhone(originalPhone);
    setMessage(null);
  }

  function handleSave() {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("phone", phone);

    startTransition(async () => {
      const result = await updateAcademyInfo(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "저장되었습니다." });
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      }
    });
  }

  return (
    <div className="bg-white rounded-xl border border-eo-border p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-eo-text-primary">학원 정보</h2>
        <p className="text-sm text-eo-text-secondary mt-1">
          학원의 기본 정보를 관리합니다.
        </p>
      </div>
      <Separator className="mb-6" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-eo-text-primary">학원명</label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setMessage(null);
            }}
            className="h-10"
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-eo-text-primary">연락처</label>
          <Input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setMessage(null);
            }}
            className="h-10"
            disabled={isPending}
          />
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${
            message.type === "success"
              ? "bg-eo-success-light text-eo-success"
              : "bg-red-50 text-eo-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel} disabled={isPending || !isDirty}>
          취소
        </Button>
        <Button
          className="bg-eo-primary hover:bg-eo-primary-hover text-white"
          onClick={handleSave}
          disabled={isPending || !isDirty}
        >
          {isPending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Teacher List Card                                                  */
/* ------------------------------------------------------------------ */

function TeacherListCard({ teachers }: { teachers: Profile[] }) {
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  function handleAddTeacher() {
    alert("준비 중입니다.");
  }

  function handleEditTeacher() {
    alert("준비 중입니다.");
  }

  function handleDeleteConfirm() {
    alert("준비 중입니다.");
    setDeleteTarget(null);
  }

  const colors = [
    "bg-eo-primary",
    "bg-eo-success",
    "bg-eo-warning",
    "bg-eo-info",
    "bg-eo-danger",
  ];

  return (
    <>
      <div className="bg-white rounded-xl border border-eo-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-eo-text-primary">강사 관리</h2>
            <p className="text-sm text-eo-text-secondary mt-1">
              등록된 강사 목록을 관리합니다.
            </p>
          </div>
          <Button
            className="bg-eo-primary hover:bg-eo-primary-hover text-white gap-2"
            onClick={handleAddTeacher}
          >
            <Plus className="w-4 h-4" />
            강사 추가
          </Button>
        </div>
        <Separator className="mb-4" />

        <div className="flex flex-col">
          {teachers.length === 0 ? (
            <p className="text-sm text-eo-text-tertiary py-4 text-center">
              등록된 강사가 없습니다.
            </p>
          ) : (
            teachers.map((t) => {
              const color = colors[t.name.charCodeAt(0) % colors.length];
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-3 border-b border-eo-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-sm font-semibold`}
                    >
                      {t.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-eo-text-primary">
                        {t.name}
                      </span>
                      <span className="text-xs text-eo-text-tertiary">
                        {t.email} · {t.created_at.split("T")[0]} 가입
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-eo-success-light text-eo-success border-0 text-xs">
                      {t.role === "admin" ? "관리자" : "강사"}
                    </Badge>
                    <button
                      className="text-eo-text-tertiary hover:text-eo-text-secondary"
                      onClick={handleEditTeacher}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="text-eo-text-tertiary hover:text-eo-danger"
                      onClick={() => setDeleteTarget(t)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>강사 삭제</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" 강사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button
              className="bg-eo-danger hover:bg-eo-danger/90 text-white"
              onClick={handleDeleteConfirm}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Placeholder Card for tabs that are not yet implemented             */
/* ------------------------------------------------------------------ */

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-xl border border-eo-border p-6">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full bg-eo-bg-muted flex items-center justify-center mb-4">
          <Bell className="w-6 h-6 text-eo-text-tertiary" />
        </div>
        <h2 className="text-lg font-semibold text-eo-text-primary mb-1">
          {label}
        </h2>
        <p className="text-sm text-eo-text-tertiary">준비 중입니다.</p>
      </div>
    </div>
  );
}
