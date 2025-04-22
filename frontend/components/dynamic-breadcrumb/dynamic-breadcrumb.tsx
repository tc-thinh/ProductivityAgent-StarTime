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
import { useEffect, useRef, useState } from "react"

const bannerMessages = [
  "We're currently in alpha testing. Please do not share personal information. Data is being collected to help improve the product.",
  "This is an alpha version. If you encounter bugs or have ideas for improvement, please contact Thinh Tran at <a href=\"mailto:thinh.tran.inbox@gmail.com\">thinh.tran.inbox@gmail.com</a> or DM me through any means.",
  "Your feedback matters! We're actively improving the experience based on user input—thank you for being part of the journey."
]

export default function DynamicBreadcrumb({ className }: { className?: string }) {
  const { path } = useBreadcrumbPath()
  const [breadcrumbItems, setBreadcrumbItems] = useState<Path[]>([])
  const [bannerMessage, setBannerMessage] = useState<string>(bannerMessages[0])
  const [isScrolling, setIsScrolling] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (path) {
      setBreadcrumbItems(path)
    }
  }, [path])

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerMessage((prevMessage) => {
        const currentIndex = bannerMessages.indexOf(prevMessage)
        const nextIndex = (currentIndex + 1) % bannerMessages.length
        return bannerMessages[nextIndex]
      })
    }, 10000) // Rotate every 10 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const bannerElement = bannerRef.current
    if (bannerElement) {
      const parentWidth = bannerElement.parentElement?.offsetWidth || 0
      const bannerWidth = bannerElement.scrollWidth

      if (bannerWidth > parentWidth * 0.5) {
        setIsScrolling(true)
      } else {
        setIsScrolling(false)
      }
    }
  }, [bannerMessage])

  return (
    <>
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
      <div
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
          width: "40%",
        }}
      >
        <div
          ref={bannerRef}
          style={{
            display: "inline-block",
            color: "red",
            animation: isScrolling
              ? "scrollBanner 15s linear infinite"
              : "none",
            userSelect: "none",
          }}
          dangerouslySetInnerHTML={{ __html: bannerMessage }}
        ></div>
      </div>
      <style jsx>{`
        @keyframes scrollBanner {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </>
  )
}
