"use client";

import { useEffect, useState } from "react";
import { Category } from "@/lib/types";
import { mockCategories } from "@/lib/data";
import { CategoryCardSection } from "./category-card";
import { toast } from "sonner"; // Import Sonner's toast

const BACKEND = process.env.BACKEND || 'http://localhost:8080';

export default function CategoryManagement({ onEdit }: { onEdit: (category: Category) => void }) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(`${BACKEND}/database/categories/`)
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => {
        console.error("Can't fetch data, use mock instead:", error);
        setCategories(mockCategories);
      });
  }, []);

  const handleSave = (updatedCategory: Category) => {
    console.log("Updated Category:", updatedCategory);

    fetch(`${BACKEND}/database/categories/?categoryId=${updatedCategory.c_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCategory),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      return response.json();
    })
    .then(data => {
      // Show success toast using Sonner
      toast("Category updated successfully!", {
        description: "Your changes have been saved.",
        action: {
          label: "Undo",
          onClick: () => {
            console.log("Undo action clicked");
            // Add logic to undo the changes if needed
          },
        },
      });
      setCategories(prev => prev.map(cat => 
        cat.c_id === updatedCategory.c_id ? updatedCategory : cat
      ));
    })
    .catch(error => {
      console.error("Error updating category:", error);
      // Show error toast using Sonner
      toast.error("Failed to save changes", {
        description: "Please try again later.",
      });
    });
  };

  return (


    <div className="grid grid-cols-3 gap-3">
      {categories.map((category) => (
        <CategoryCardSection
          key={category.c_id}
          category={category}
          onEdit={() => onEdit(category)}
        />
      ))}
    </div>
  );
}