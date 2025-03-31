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
import { useEffect, useState } from "react" // Import useEffect and useState

export default function DynamicBreadcrumb() {
  const { path } = useBreadcrumbPath()
  const [breadcrumbItems, setBreadcrumbItems] = useState<Path[]>([])

  // Use useEffect to generate breadcrumb items on the client side
  useEffect(() => {
    if (path) {
      setBreadcrumbItems(path)
    }
  }, [path])

  return (
    <Breadcrumb>
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