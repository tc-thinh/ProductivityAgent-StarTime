"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

import CategoryManagement from "@/components/category-management/category-manager"
import { Category } from "@/lib/types"
import { mockCategories } from "@/lib/data"

import { useUserStore } from "@/store/userStore"
import { ProgressPage } from "@/components/progress-bar/progress-bar"

import { fetchBackendService } from "@/lib/utils"

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [loading, setLoading] = useState(true)  // Track loading state

  const { hydrated, accessToken } = useUserStore()

  useEffect(() => {
    if (hydrated && accessToken) {
      if (hydrated && accessToken) {
        // Simulate a delay for testing the progress bar
        fetchBackendService<Category[]>({
          endpoint: `database/categories/?token=${accessToken}&active=false`,
          method: "GET",
        })
        .then(({ success, data, error }) => {
          if (success && data) {
            setCategories(data)
          } else {
            console.error("Can't fetch data, use mock instead:", error)
            setCategories(mockCategories)
          }
          setLoading(false)
        })
        .catch(error => {
          console.error("Can't fetch data, use mock instead:", error)
          setCategories(mockCategories)
          setLoading(false)
        })
      }
    }
  }, [hydrated, accessToken, refreshTrigger])

  const handleSave = async (updatedCategory: Category) => {
    const { success, error } = await fetchBackendService(
      {
        endpoint: "database/categories/",
        method: "PUT",
        body: {
          categoryId: updatedCategory.cat_id,
          token: accessToken,
          category: updatedCategory,
        },
      }
    )
    
    if (success) toast.success("Category updated!")
    else toast.error("Something went wrong. Please try again.")

    setRefreshTrigger(refreshTrigger + 1)
  }

  if (loading) {
    return <ProgressPage initPercentage={33} timeDone={500} />
  }

  return (
    <>
      <div className="p-4 border-gray-200 overflow-y-auto">
        <CategoryManagement
          saveEdit={handleSave}
          initCategories={categories}
        />
      </div>
    </>
  )
}
