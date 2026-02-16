import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { getStudents } from "@/lib/actions/students";
import { getClasses } from "@/lib/actions/classes";
import { AddStudentDialog } from "@/components/students/add-student-dialog";
import Link from "next/link";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; class?: string; status?: string }>;
}) {
  const params = await searchParams;
  const [students, classes] = await Promise.all([
    getStudents({
      search: params.search,
      classId: params.class,
      activeOnly: params.status === "inactive" ? false : params.status === "all" ? undefined : true,
    }),
    getClasses(),
  ]);

  return (
    <>
      <Header title="학생 관리" />
      <div className="flex flex-col gap-6 p-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <form className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vb-text-tertiary" />
              <Input
                name="search"
                placeholder="학생 검색..."
                defaultValue={params.search}
                className="pl-9 h-10 w-[240px]"
              />
            </div>
            <select
              name="class"
              defaultValue={params.class}
              className="h-10 px-3 rounded-lg border border-vb-border bg-white text-sm text-vb-text-secondary"
            >
              <option value="">전체 반</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={params.status}
              className="h-10 px-3 rounded-lg border border-vb-border bg-white text-sm text-vb-text-secondary"
            >
              <option value="">재원생</option>
              <option value="inactive">퇴원생</option>
              <option value="all">전체</option>
            </select>
            <Button type="submit" variant="outline" size="sm">
              검색
            </Button>
          </form>
          <AddStudentDialog />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-vb-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-vb-bg-muted">
                <th className="text-left px-5 py-3 text-[13px] font-semibold text-vb-text-secondary">
                  이름
                </th>
                <th className="text-left px-5 py-3 text-[13px] font-semibold text-vb-text-secondary">
                  반
                </th>
                <th className="text-left px-5 py-3 text-[13px] font-semibold text-vb-text-secondary">
                  학교/학년
                </th>
                <th className="text-left px-5 py-3 text-[13px] font-semibold text-vb-text-secondary">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-vb-text-tertiary"
                  >
                    등록된 학생이 없습니다.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const className = s.class_students
                    ?.map((cs) => cs.classes?.name)
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <tr
                      key={s.id}
                      className={`border-t border-vb-border hover:bg-vb-bg-muted/50 cursor-pointer ${
                        !s.is_active ? "opacity-60" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/students/${s.id}`}
                          className="text-sm font-medium text-vb-text-primary hover:underline"
                        >
                          {s.name}
                          {s.english_name && (
                            <span className="text-vb-text-tertiary ml-1">
                              ({s.english_name})
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-vb-text-secondary">
                        {className || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-vb-text-secondary">
                        {[s.school, s.grade].filter(Boolean).join(" ") || "-"}
                      </td>
                      <td className="px-5 py-3.5">
                        {s.is_active ? (
                          <Badge className="bg-vb-success-light text-vb-success border-0 text-xs">
                            재원
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            퇴원
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
