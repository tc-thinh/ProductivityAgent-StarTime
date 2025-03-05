"use client"

import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

import CategoryManagement from "@/components/category-management/category-manager"
import { Category } from "@/lib/types";

export default function Landing() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleSave = (updatedCategory: Category) => {
    setCategories(prev => 
      prev.map(cat => cat.c_id === updatedCategory.c_id ? updatedCategory : cat)
    );
    setEditingCategory(null);
  };

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
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header> 

        <div className="p-4 border-r border-gray-200 overflow-y-auto">
          <CategoryManagement 
            onEdit={setEditingCategory} 
          />

        </div>
    </>
  );
}
