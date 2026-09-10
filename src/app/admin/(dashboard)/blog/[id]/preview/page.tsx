import { BlogPreviewModule } from "@/components/admin/blog-module";

export default async function AdminBlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogPreviewModule id={id} />;
}
