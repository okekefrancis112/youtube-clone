"use client";

import { FilterCarousel } from "@/components/filter-carousel";
import { Category, isSuspenseResult } from "@/trpc";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategoriesSectionProps {
  categoryId?: string;
}

export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const CategoriesSkeleton = () => {
  return <FilterCarousel isLoading data={[]} onSelect={() => console.log()} />
}

// const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
//   const router = useRouter();
//   const [categoriesResult]: any = trpc.categories.getMany.useSuspenseQuery();

//   console.log("CategoriesSectionSuspense", { categoriesResult });

//   // Extract the actual categories array from the json property
//   const categories = categoriesResult.json || [];

//   const data = categories.map((category: any) => ({
//     value: category.id,
//     label: category.name,
//   }));

//   const onSelect = (value: string | null) => {
//     const url = new URL(window.location.href);

//     if(value) {
//       url.searchParams.set("categoryId", value);
//     } else {
//       url.searchParams.delete("categoryId");
//     }

//     router.push(url.toString());
//   };

//   return <FilterCarousel onSelect={onSelect} value={categoryId} data={data} />
// }

export const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
  const router = useRouter();
  const [categoriesResult] = trpc.categories.getMany.useSuspenseQuery();

      // Debug logging - check all possible structures
    console.log("=== CATEGORIES DEBUG ===");
    console.log("Raw result:", categoriesResult);
    console.log("Type:", typeof categoriesResult);
    console.log("Is array:", Array.isArray(categoriesResult));
    console.log("Keys:", Object.keys(categoriesResult || {}));
    console.log("========================");

  // Type-safe extraction
  let categories: Category[] = [];

  if (isSuspenseResult<Category[]>(categoriesResult)) {
    categories = categoriesResult.json;
  } else if (Array.isArray(categoriesResult)) {
    // Fallback: if it's ever just the array directly
    categories = categoriesResult;
  } else {
    console.error('Unexpected categories result structure:', categoriesResult);
    categories = [];
  }

  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);

    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }

    router.push(url.toString());
  };

  return <FilterCarousel onSelect={onSelect} value={categoryId} data={data} />;
};