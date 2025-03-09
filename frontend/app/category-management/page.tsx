"use client"

import { useState, useEffect } from "react";
import { toast } from "sonner"

import CategoryManagement from "@/components/category-management/category-manager"
import { Category } from "@/lib/types"
import { mockCategories } from "@/lib/data";

const BACKEND = process.env.BACKEND || 'http://localhost:8080';

export default function Landing() {
  const [categories, setCategories] = useState<Category[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    fetch(`${BACKEND}/database/categories/`)
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => {
        console.error("Can't fetch data, use mock instead:", error);
        setCategories(mockCategories);
      });
  }, [refreshTrigger]);

  const handleSave = (updatedCategory: Category) => {
    fetch(`${BACKEND}/database/categories/?categoryId=${updatedCategory.cat_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCategory),
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update category');

        toast("Category updated successfully!", {
          description: "Your changes have been saved."
        });
        return response.json();
      })
      .then(() => {
        setRefreshTrigger(prev => prev + 1); // Trigger a re-fetch
      })
      .catch(error => {
        console.error("Error updating category:", error)
        toast.error("Failed to save changes.", {
          description: "An error occurred. Please try again later.",
        })
      });
  }

  return (
    <>
      <div className="p-4 border-r border-gray-200 overflow-y-auto">
        <CategoryManagement
          saveEdit={handleSave}
          initCategories={categories}
        />

      </div>
    </>
  );
}
