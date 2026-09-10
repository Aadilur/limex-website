import { BlogEditorModule } from "@/components/admin/blog-module";

export default async function AdminBlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogEditorModule id={id} />;
}
