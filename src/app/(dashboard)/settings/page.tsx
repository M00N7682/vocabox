import { Header } from "@/components/layout/header";
import { SettingsClient } from "@/components/settings/settings-client";
import { getAcademyInfo, getTeachers } from "@/lib/actions/settings";

export default async function SettingsPage() {
  const [academy, teachers] = await Promise.all([
    getAcademyInfo(),
    getTeachers(),
  ]);

  return (
    <>
      <Header title="설정" />
      <SettingsClient academy={academy} teachers={teachers} />
    </>
  );
}
