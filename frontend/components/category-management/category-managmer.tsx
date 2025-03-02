"use client";

import { useEffect, useState } from "react";
import { Intent, Section } from "@blueprintjs/core";
import { Category } from "@/lib/types";
import { mockCategories } from "@/lib/data";
import { CategoryCardSection } from "./category-card"

const BACKEND = process.env.BACKEND || 'http://localhost:8080';

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [notification, setNotification] = useState<{ message: string; intent: Intent } | null>(null);

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
      setNotification({ message: "Changes saved successfully!", intent: Intent.SUCCESS });
      setTimeout(() => setNotification(null), 3000);
      setCategories(prev => prev.map(cat => 
        cat.c_id === updatedCategory.c_id ? updatedCategory : cat
      ));
    })
    .catch(error => {
      console.error("Error updating category:", error);
      setNotification({ message: "Failed to save changes", intent: Intent.DANGER });
      setTimeout(() => setNotification(null), 3000);
    });
  };

  return (
    <div className="p-5 min-h-screen bg-slate-50">
      {notification && (
        <div
          className="fixed top-5 right-5 p-3 text-white rounded-lg shadow-xl z-50"
          style={{
            backgroundColor: notification.intent === Intent.SUCCESS ? "#0F9960" : "#DB3737",
          }}
        >
          {notification.message}  
        </div>
      )}

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
          {categories.map((category) => (
            <CategoryCardSection
              key={category.c_id}
              category={category}
              onSave={handleSave}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
