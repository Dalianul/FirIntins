"use client"

import { ReactNode, useState } from "react"

interface ProductTabsProps {
  description?: string | null
  reviewsSection: ReactNode
}

export function ProductTabs({ description, reviewsSection }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description")

  return (
    <div>
      <div className="flex gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("description")}
          className={`text-sm font-outfit py-3 border-b-2 transition-colors ${
            activeTab === "description"
              ? "border-moss text-cream"
              : "border-transparent text-fog hover:text-cream"
          }`}
        >
          Descriere
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`text-sm font-outfit py-3 border-b-2 transition-colors ${
            activeTab === "reviews"
              ? "border-moss text-cream"
              : "border-transparent text-fog hover:text-cream"
          }`}
        >
          Recenzii
        </button>
      </div>

      <div className="pt-6">
        <div className={activeTab === "description" ? "" : "hidden"}>
          {description ? (
            <p className="text-fog text-sm font-outfit leading-relaxed">{description}</p>
          ) : (
            <p className="text-fog text-sm font-outfit">Nu există descriere pentru acest produs.</p>
          )}
        </div>

        <div className={activeTab === "reviews" ? "" : "hidden"}>
          {reviewsSection}
        </div>
      </div>
    </div>
  )
}
