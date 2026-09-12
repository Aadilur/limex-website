import { ServicePageEditorModule } from "@/components/admin/service-pages-module";

export default async function AdminServiceEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServicePageEditorModule id={id} />;
}
