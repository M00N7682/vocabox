import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { getAcademyInfo, getTeachers } from "@/lib/actions/settings";

const settingsNav = [
  { label: "학원 정보", icon: Building2, active: true },
  { label: "강사 관리", icon: Users, active: false },
  { label: "알림 설정", icon: Bell, active: false },
  { label: "구독/결제", icon: CreditCard, active: false },
  { label: "보안", icon: Shield, active: false },
];

export default async function SettingsPage() {
  const [academy, teachers] = await Promise.all([
    getAcademyInfo(),
    getTeachers(),
  ]);

  return (
    <>
      <Header title="설정" />
      <div className="flex gap-6 p-8">
        {/* Settings Nav */}
        <div className="w-[220px] shrink-0 bg-white rounded-xl border border-vb-border py-4">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                  item.active
                    ? "bg-vb-primary-light text-vb-primary font-semibold border-l-[3px] border-vb-primary"
                    : "text-vb-text-secondary hover:bg-vb-bg-muted"
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
          {/* Academy Info Card */}
          <div className="bg-white rounded-xl border border-vb-border p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-vb-text-primary">
                학원 정보
              </h2>
              <p className="text-sm text-vb-text-secondary mt-1">
                학원의 기본 정보를 관리합니다.
              </p>
            </div>
            <Separator className="mb-6" />

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-vb-text-primary">
                  학원명
                </label>
                <Input
                  defaultValue={academy?.name ?? ""}
                  className="h-10"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-vb-text-primary">
                  연락처
                </label>
                <Input
                  defaultValue={academy?.phone ?? ""}
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">취소</Button>
              <Button className="bg-vb-primary hover:bg-vb-primary-hover text-white">
                저장
              </Button>
            </div>
          </div>

          {/* Teacher Card */}
          <div className="bg-white rounded-xl border border-vb-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-vb-text-primary">
                  강사 관리
                </h2>
                <p className="text-sm text-vb-text-secondary mt-1">
                  등록된 강사 목록을 관리합니다.
                </p>
              </div>
              <Button className="bg-vb-primary hover:bg-vb-primary-hover text-white gap-2">
                <Plus className="w-4 h-4" />
                강사 추가
              </Button>
            </div>
            <Separator className="mb-4" />

            <div className="flex flex-col">
              {teachers.length === 0 ? (
                <p className="text-sm text-vb-text-tertiary py-4 text-center">
                  등록된 강사가 없습니다.
                </p>
              ) : (
                teachers.map((t) => {
                  const colors = [
                    "bg-vb-primary",
                    "bg-vb-success",
                    "bg-vb-warning",
                    "bg-vb-info",
                    "bg-vb-danger",
                  ];
                  const color =
                    colors[t.name.charCodeAt(0) % colors.length];
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-3 border-b border-vb-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-sm font-semibold`}
                        >
                          {t.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-vb-text-primary">
                            {t.name}
                          </span>
                          <span className="text-xs text-vb-text-tertiary">
                            {t.email} · {t.created_at.split("T")[0]} 가입
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-vb-success-light text-vb-success border-0 text-xs">
                          {t.role === "admin" ? "관리자" : "강사"}
                        </Badge>
                        <button className="text-vb-text-tertiary hover:text-vb-text-secondary">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="text-vb-text-tertiary hover:text-vb-danger">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
