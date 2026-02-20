import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Users, Bell, TriangleAlert, Clock, Check } from "lucide-react";
import Link from "next/link";
import { getAcademyInfo, updateAcademyInfo, getTeachers } from "@/lib/actions/settings";
import { getSettings, updateSettings } from "@/lib/actions/academy-settings";

const tabs = [
  { key: "academy", label: "학원 정보", icon: Building2 },
  { key: "teachers", label: "강사 관리", icon: Users },
  { key: "risk", label: "위험 기준 설정", icon: TriangleAlert },
  { key: "notifications", label: "알림 설정", icon: Bell },
  { key: "attendance_rules", label: "출결 규칙", icon: Clock },
];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const activeTab = tabParam ?? "academy";

  const [academy, settings, teachers] = await Promise.all([
    getAcademyInfo(),
    getSettings(),
    activeTab === "teachers" ? getTeachers() : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader title="설정" />

      <div className="flex gap-6 flex-1">
        {/* Left Nav */}
        <div className="flex flex-col gap-1 w-[220px] shrink-0">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <Link
                key={item.key}
                href={`/settings?tab=${item.key}`}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg ${
                  isActive
                    ? "bg-eo-primary text-white"
                    : "text-eo-text-secondary hover:bg-eo-bg-surface"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[13px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex flex-col gap-6 flex-1 pl-6 border-l border-eo-border">

          {/* ── 학원 정보 tab ── */}
          {activeTab === "academy" && (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-eo-text-primary">학원 정보</h2>
                <p className="text-[13px] text-eo-text-secondary">
                  학원의 기본 정보를 설정합니다
                </p>
              </div>

              <div className="h-px bg-eo-border" />

              <form
                action={async (formData: FormData) => {
                  "use server";
                  await updateAcademyInfo(formData);
                }}
                className="flex flex-col gap-6"
              >
                {[
                  {
                    label: "학원명",
                    name: "name",
                    desc: "서비스에 표시될 학원명",
                    value: academy?.name ?? "",
                  },
                  {
                    label: "대표 연락처",
                    name: "phone",
                    desc: "학부모 알림에 표시",
                    value: academy?.phone ?? "",
                  },
                  {
                    label: "학원 주소",
                    name: "address",
                    desc: "위치 정보",
                    value: academy?.address ?? "",
                  },
                ].map((f) => (
                  <div key={f.label} className="flex gap-4">
                    <div className="flex flex-col gap-1 w-[160px] shrink-0">
                      <span className="text-[13px] font-semibold text-eo-text-primary">
                        {f.label}
                      </span>
                      <span className="text-xs text-eo-text-secondary">{f.desc}</span>
                    </div>
                    <Input name={f.name} defaultValue={f.value} className="h-10" />
                  </div>
                ))}

                {/* Operating Hours */}
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1 w-[160px] shrink-0">
                    <span className="text-[13px] font-semibold text-eo-text-primary">
                      운영 시간
                    </span>
                    <span className="text-xs text-eo-text-secondary">
                      학원 운영 시간대
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Input
                      name="operating_hours_start"
                      defaultValue={
                        academy?.operating_hours_start?.slice(0, 5) ?? "14:00"
                      }
                      className="h-10 w-[120px]"
                    />
                    <span className="text-sm text-eo-text-secondary">~</span>
                    <Input
                      name="operating_hours_end"
                      defaultValue={
                        academy?.operating_hours_end?.slice(0, 5) ?? "22:00"
                      }
                      className="h-10 w-[120px]"
                    />
                  </div>
                </div>

                <div className="h-px bg-eo-border" />

                <div className="flex gap-2.5">
                  <Button type="reset" variant="outline">
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
                  >
                    <Check className="w-4 h-4" />
                    저장
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ── 강사 관리 tab ── */}
          {activeTab === "teachers" && (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-eo-text-primary">강사 관리</h2>
                <p className="text-[13px] text-eo-text-secondary">
                  학원에 등록된 강사 목록입니다.
                </p>
              </div>

              <div className="h-px bg-eo-border" />

              <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
                <div className="flex items-center px-4 py-2.5 bg-eo-bg-surface border-b border-eo-border">
                  <span className="text-xs font-semibold text-eo-text-secondary flex-1">
                    이름
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary flex-1">
                    이메일
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary w-[80px]">
                    역할
                  </span>
                  <span className="text-xs font-semibold text-eo-text-secondary w-[120px]">
                    가입일
                  </span>
                </div>
                {teachers.length > 0 ? (
                  teachers.map((t, i) => (
                    <div
                      key={t.id}
                      className={`flex items-center px-4 py-3 ${
                        i < teachers.length - 1 ? "border-b border-eo-border" : ""
                      }`}
                    >
                      <span className="text-[13px] font-medium text-eo-text-primary flex-1">
                        {t.name}
                      </span>
                      <span className="text-[13px] text-eo-text-secondary flex-1">
                        {t.email}
                      </span>
                      <div className="w-[80px]">
                        <span
                          className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            t.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {t.role === "admin" ? "관리자" : "강사"}
                        </span>
                      </div>
                      <span className="text-[13px] text-eo-text-secondary w-[120px]">
                        {t.created_at.slice(0, 10)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
                    등록된 강사가 없습니다.
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── 위험 기준 설정 tab ── */}
          {activeTab === "risk" && (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-eo-text-primary">
                  위험 기준 설정
                </h2>
                <p className="text-[13px] text-eo-text-secondary">
                  위험 학생 판단 기준을 설정합니다.
                </p>
              </div>

              <div className="h-px bg-eo-border" />

              <form
                action={async (formData: FormData) => {
                  "use server";
                  await updateSettings(formData);
                }}
                className="flex flex-col gap-6"
              >
                {[
                  {
                    label: "취약 점수 기준",
                    name: "weak_threshold",
                    desc: "이 점수 미만을 취약으로 판단 (점)",
                    value: settings?.weak_threshold ?? 60,
                  },
                  {
                    label: "위험 점수 기준",
                    name: "risk_score_threshold",
                    desc: "위험 판단 점수 기준 (점)",
                    value: settings?.risk_score_threshold ?? 60,
                  },
                  {
                    label: "위험 취약 횟수",
                    name: "risk_score_count",
                    desc: "연속 취약 횟수 초과 시 위험 (회)",
                    value: settings?.risk_score_count ?? 3,
                  },
                  {
                    label: "위험 결석률",
                    name: "risk_absence_rate",
                    desc: "결석률 초과 시 위험 (%)",
                    value: settings?.risk_absence_rate ?? 15,
                  },
                  {
                    label: "위험 미제출 횟수",
                    name: "risk_missing_count",
                    desc: "과제 미제출 횟수 초과 시 위험 (회)",
                    value: settings?.risk_missing_count ?? 3,
                  },
                ].map((f) => (
                  <div key={f.name} className="flex gap-4">
                    <div className="flex flex-col gap-1 w-[200px] shrink-0">
                      <span className="text-[13px] font-semibold text-eo-text-primary">
                        {f.label}
                      </span>
                      <span className="text-xs text-eo-text-secondary">{f.desc}</span>
                    </div>
                    <Input
                      type="number"
                      name={f.name}
                      defaultValue={f.value}
                      className="h-10 w-[120px]"
                    />
                  </div>
                ))}

                {/* Hidden fields to keep other settings intact */}
                <input
                  type="hidden"
                  name="late_threshold_min"
                  value={settings?.late_threshold_min ?? 10}
                />
                <input
                  type="hidden"
                  name="absent_threshold_min"
                  value={settings?.absent_threshold_min ?? 30}
                />
                <input
                  type="hidden"
                  name="notify_attendance"
                  value={String(settings?.notify_attendance ?? true)}
                />
                <input
                  type="hidden"
                  name="notify_score"
                  value={String(settings?.notify_score ?? true)}
                />
                <input
                  type="hidden"
                  name="notify_assignment"
                  value={String(settings?.notify_assignment ?? true)}
                />
                <input
                  type="hidden"
                  name="notify_monthly_report"
                  value={String(settings?.notify_monthly_report ?? false)}
                />

                <div className="h-px bg-eo-border" />

                <div className="flex gap-2.5">
                  <Button type="reset" variant="outline">
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
                  >
                    <Check className="w-4 h-4" />
                    저장
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ── 알림 설정 tab ── */}
          {activeTab === "notifications" && (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-eo-text-primary">알림 설정</h2>
                <p className="text-[13px] text-eo-text-secondary">
                  학부모에게 발송할 알림 항목을 설정합니다.
                </p>
              </div>

              <div className="h-px bg-eo-border" />

              <form
                action={async (formData: FormData) => {
                  "use server";
                  await updateSettings(formData);
                }}
                className="flex flex-col gap-5"
              >
                {/* Hidden fields to keep risk settings intact */}
                <input
                  type="hidden"
                  name="weak_threshold"
                  value={settings?.weak_threshold ?? 60}
                />
                <input
                  type="hidden"
                  name="risk_score_threshold"
                  value={settings?.risk_score_threshold ?? 60}
                />
                <input
                  type="hidden"
                  name="risk_score_count"
                  value={settings?.risk_score_count ?? 3}
                />
                <input
                  type="hidden"
                  name="risk_absence_rate"
                  value={settings?.risk_absence_rate ?? 15}
                />
                <input
                  type="hidden"
                  name="risk_missing_count"
                  value={settings?.risk_missing_count ?? 3}
                />
                <input
                  type="hidden"
                  name="late_threshold_min"
                  value={settings?.late_threshold_min ?? 10}
                />
                <input
                  type="hidden"
                  name="absent_threshold_min"
                  value={settings?.absent_threshold_min ?? 30}
                />

                {[
                  {
                    label: "출결 알림",
                    name: "notify_attendance",
                    desc: "출석/결석 시 학부모에게 알림",
                    value: settings?.notify_attendance ?? true,
                  },
                  {
                    label: "성적 알림",
                    name: "notify_score",
                    desc: "성적 입력 시 학부모에게 알림",
                    value: settings?.notify_score ?? true,
                  },
                  {
                    label: "과제 알림",
                    name: "notify_assignment",
                    desc: "과제 미제출 시 학부모에게 알림",
                    value: settings?.notify_assignment ?? true,
                  },
                  {
                    label: "월간 리포트",
                    name: "notify_monthly_report",
                    desc: "월말 요약 리포트를 학부모에게 발송",
                    value: settings?.notify_monthly_report ?? false,
                  },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-[13px] font-semibold text-eo-text-primary">
                        {f.label}
                      </span>
                      <span className="text-xs text-eo-text-secondary">{f.desc}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name={f.name}
                        value="true"
                        defaultChecked={f.value}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-eo-primary" />
                    </label>
                  </div>
                ))}

                <div className="h-px bg-eo-border" />

                <div className="flex gap-2.5">
                  <Button type="reset" variant="outline">
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
                  >
                    <Check className="w-4 h-4" />
                    저장
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ── 출결 규칙 tab ── */}
          {activeTab === "attendance_rules" && (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-eo-text-primary">출결 규칙</h2>
                <p className="text-[13px] text-eo-text-secondary">
                  지각 및 결석 판단 기준 시간을 설정합니다.
                </p>
              </div>

              <div className="h-px bg-eo-border" />

              <form
                action={async (formData: FormData) => {
                  "use server";
                  await updateSettings(formData);
                }}
                className="flex flex-col gap-6"
              >
                {/* Hidden fields to preserve other settings */}
                <input
                  type="hidden"
                  name="weak_threshold"
                  value={settings?.weak_threshold ?? 60}
                />
                <input
                  type="hidden"
                  name="risk_score_threshold"
                  value={settings?.risk_score_threshold ?? 60}
                />
                <input
                  type="hidden"
                  name="risk_score_count"
                  value={settings?.risk_score_count ?? 3}
                />
                <input
                  type="hidden"
                  name="risk_absence_rate"
                  value={settings?.risk_absence_rate ?? 15}
                />
                <input
                  type="hidden"
                  name="risk_missing_count"
                  value={settings?.risk_missing_count ?? 3}
                />
                <input
                  type="hidden"
                  name="notify_attendance"
                  value={String(settings?.notify_attendance ?? true)}
                />
                <input
                  type="hidden"
                  name="notify_score"
                  value={String(settings?.notify_score ?? true)}
                />
                <input
                  type="hidden"
                  name="notify_assignment"
                  value={String(settings?.notify_assignment ?? true)}
                />
                <input
                  type="hidden"
                  name="notify_monthly_report"
                  value={String(settings?.notify_monthly_report ?? false)}
                />

                {[
                  {
                    label: "지각 기준 시간",
                    name: "late_threshold_min",
                    desc: "수업 시작 후 이 시간(분) 이내 출석 시 지각",
                    value: settings?.late_threshold_min ?? 10,
                    unit: "분",
                  },
                  {
                    label: "결석 기준 시간",
                    name: "absent_threshold_min",
                    desc: "수업 시작 후 이 시간(분) 이후 출석 시 결석",
                    value: settings?.absent_threshold_min ?? 30,
                    unit: "분",
                  },
                ].map((f) => (
                  <div key={f.name} className="flex gap-4">
                    <div className="flex flex-col gap-1 w-[200px] shrink-0">
                      <span className="text-[13px] font-semibold text-eo-text-primary">
                        {f.label}
                      </span>
                      <span className="text-xs text-eo-text-secondary">{f.desc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        name={f.name}
                        defaultValue={f.value}
                        className="h-10 w-[100px]"
                      />
                      <span className="text-[13px] text-eo-text-secondary">
                        {f.unit}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="h-px bg-eo-border" />

                <div className="flex gap-2.5">
                  <Button type="reset" variant="outline">
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
                  >
                    <Check className="w-4 h-4" />
                    저장
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
