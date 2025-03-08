"use client"

import { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center gap-2 px-4">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/category-management">
                  Category Manager
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="p-4 border-r border-gray-200 overflow-y-auto">
        <CategoryManagement
          saveEdit={handleSave}
          initCategories={categories}
        />

      </div>
    </>
  );
}
