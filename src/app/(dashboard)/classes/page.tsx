import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { getClasses } from "@/lib/actions/classes";

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <>
      <Header title="반 관리" />
      <div className="flex flex-col gap-6 p-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-vb-text-primary">
            전체 반 목록
          </h2>
          <Button className="bg-vb-primary hover:bg-vb-primary-hover text-white gap-2">
            <Plus className="w-4 h-4" />
            반 추가
          </Button>
        </div>

        {/* Card Grid */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-xl border border-vb-border p-12 text-center">
            <p className="text-sm text-vb-text-tertiary">
              등록된 반이 없습니다. 반을 추가해주세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {classes.map((cls) => {
              const studentCount = cls.class_students?.length ?? 0;
              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-xl border border-vb-border p-6 cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-vb-text-primary">
                      {cls.name}
                    </h3>
                    <Badge className="bg-vb-info-light text-vb-info border-0 text-xs">
                      {studentCount}명
                    </Badge>
                  </div>
                  <p className="text-sm text-vb-text-secondary mb-4">
                    {cls.description || "설명 없음"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
