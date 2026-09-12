import { redirect } from "next/navigation";

type ServiceAliasRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function ServiceAliasRoute({ params }: ServiceAliasRouteProps) {
  const { slug } = await params;
  redirect(`/services/${encodeURIComponent(slug)}`);
}
