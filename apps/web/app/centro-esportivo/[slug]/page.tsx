import { redirect } from "next/navigation";

export default async function CentroEsportivoSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Normaliza slugs comuns como 'am-manaus-arena-show' para 'arena-show'
  let targetSlug = slug;
  if (slug.includes("arena-show")) {
    targetSlug = "arena-show";
  } else if (slug.includes("beach-arena")) {
    targetSlug = "beach-arena-itaim";
  } else if (slug.includes("galaxy")) {
    targetSlug = "galaxy-futsal-society";
  }

  redirect(`/schedule?venue=${targetSlug}`);
}
