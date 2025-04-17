"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { Path } from "@/lib/types"
import useBreadcrumbPath from "@/store/breadcrumbPathStore"
import { useEffect, useState } from "react" 

import { HistoryDialog } from "@/components/history-dialog/history-dialog"

export default function DynamicBreadcrumb({ className }: { className?: string }) {
  const { path } = useBreadcrumbPath()
  const [breadcrumbItems, setBreadcrumbItems] = useState<Path[]>([])

  useEffect(() => {
    if (path) {
      setBreadcrumbItems(path)
    }
  }, [path])

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbLink href={item.reference}>
              {item.displayName}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
