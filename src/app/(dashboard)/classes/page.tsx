import { Header } from "@/components/layout/header";
import { ClassesClient } from "@/components/classes/classes-client";
import { getClasses } from "@/lib/actions/classes";

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <>
      <Header title="반 관리" />
      <div className="flex flex-col gap-6 p-8">
        <ClassesClient classes={classes} />
      </div>
    </>
  );
}
