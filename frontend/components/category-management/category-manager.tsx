"use client";

import { Category } from "@/lib/types";
import { CategoryCardSection } from "./category-card";

export default function CategoryManagement({ saveEdit, initCategories }: { saveEdit: (category: Category) => void, initCategories:  Category[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {initCategories.map((category) => (
        <CategoryCardSection
          key={category.cat_id}
          category={category}
          saveEdit={saveEdit}
        />
      ))}
    </div>
  );
}
