"use client"; // Mark as a Client Component

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { usePathname } from "next/navigation"; 

// Mapping of URL segments to display names of sidebar component
const pathToNameMap: { [key: string]: string } = {
  "category-management": "Category Manager",
  "history": "History",
  "dashboard": "Dashboard",
};

const generateBreadcrumbItems = (pathname: string) => {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbItems = paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join("/")}`; 
    const label = pathToNameMap[path] || path.replace(/-/g, " "); 
    return { href, label };
  });
  return breadcrumbItems;
};

export default function DynamicBreadcrumb() {
  const pathname = usePathname(); 
  const breadcrumbItems = generateBreadcrumbItems(pathname); 

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbLink href={item.href}>
              {item.label}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}