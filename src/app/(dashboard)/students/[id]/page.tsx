import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { getStudent, getStudentScores } from "@/lib/actions/students";
import { notFound } from "next/navigation";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let student;
  try {
    student = await getStudent(id);
  } catch {
    notFound();
  }

  const scores = await getStudentScores(id);

  const className = student.class_students
    ?.map((cs) => cs.classes?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Header title="학생 상세" />
      <div className="flex flex-col gap-6 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/students">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-[13px]"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-2 text-[13px]">
            <Pencil className="w-4 h-4" />
            수정
          </Button>
        </div>

        {/* Main content */}
        <div className="flex gap-6">
          {/* Left - Info Card */}
          <div className="w-[360px] shrink-0 bg-white rounded-xl border border-vb-border p-6">
            <h2 className="text-base font-semibold text-vb-text-primary mb-4">
              기본 정보
            </h2>
            <div className="flex flex-col gap-4">
              {[
                ["이름", student.name],
                ["영어 이름", student.english_name || "-"],
                ["반", className || "-"],
                [
                  "학교/학년",
                  [student.school, student.grade].filter(Boolean).join(" ") ||
                    "-",
                ],
                ["연락처", student.phone || "-"],
                ["학부모 연락처", student.parent_phone || "-"],
                ["메모", student.memo || "-"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-xs text-vb-text-tertiary">
                    {label}
                  </span>
                  <span className="text-[15px] font-medium text-vb-text-primary">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Score History */}
          <div className="flex-1 bg-white rounded-xl border border-vb-border p-6">
            <h2 className="text-base font-semibold text-vb-text-primary mb-4">
              점수 이력
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-vb-border">
                  <th className="text-left pb-3 text-[13px] font-semibold text-vb-text-secondary">
                    날짜
                  </th>
                  <th className="text-left pb-3 text-[13px] font-semibold text-vb-text-secondary">
                    단어장
                  </th>
                  <th className="text-left pb-3 text-[13px] font-semibold text-vb-text-secondary">
                    유형
                  </th>
                  <th className="text-right pb-3 text-[13px] font-semibold text-vb-text-secondary">
                    점수
                  </th>
                </tr>
              </thead>
              <tbody>
                {scores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-sm text-vb-text-tertiary"
                    >
                      아직 점수 이력이 없습니다.
                    </td>
                  </tr>
                ) : (
                  scores.map((s) => {
                    const pct = Number(s.score_percentage);
                    const color =
                      pct >= 90
                        ? "text-vb-success"
                        : pct >= 80
                          ? "text-vb-warning"
                          : "text-vb-danger";
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-vb-border last:border-0"
                      >
                        <td className="py-3 text-sm text-vb-text-secondary">
                          {s.test_date}
                        </td>
                        <td className="py-3 text-sm text-vb-text-primary">
                          {s.vocab_books?.title}
                        </td>
                        <td className="py-3 text-sm text-vb-text-secondary">
                          {s.test_type === "eng_to_kor" ? "영→한" : "한→영"}
                        </td>
                        <td
                          className={`py-3 text-sm font-bold text-right ${color}`}
                        >
                          {s.correct_count}/{s.total_count} ({pct}%)
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
