"use client";

import { useState } from "react";
import { Card, Button, SectionCard } from "@blueprintjs/core";

import { CategoryCard } from "@/lib/types";

export const CategoryCardSection: React.FC<CategoryCard> = ({ category, onSave }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempTitle, setTempTitle] = useState(category.c_title);
  const [tempDescription, setTempDescription] = useState(category.c_description);

  const handleSave = () => {
    onSave({
      ...category,
      c_title: tempTitle,
      c_description: tempDescription,
    });
    setIsEditingTitle(false);
    setIsEditingDescription(false);
  };

  return (
    <SectionCard className="min-w-[300px] max-w-[400px] bg-transparent shadow-none">
      <Card
        className="w-full p-4 rounded-xl shadow-lg flex flex-col justify-between transition-all hover:shadow-xl"
        style={{
          backgroundColor: category.c_background,
          color: category.c_foreground,
          minHeight: '250px'
        }}
      >
        <div className="space-y-4">
          {/* Title Section */}
          <div
            className={`p-2 rounded-lg ${isEditingTitle ? "bg-white bg-opacity-20" : ""}`}
            onClick={() => setIsEditingTitle(true)}
          >
            {isEditingTitle ? (
              <input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="text-xl font-bold w-full bg-transparent focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Title"
                autoFocus
              />
            ) : (
              <div className="text-xl font-bold truncate cursor-pointer">
                {tempTitle || "Title"}
              </div>
            )}
          </div>

          {/* Description Section */}
          <div
            className={`p-2 rounded-lg ${isEditingDescription ? "bg-white bg-opacity-20" : ""}`}
            onClick={() => setIsEditingDescription(true)}
          >
            {isEditingDescription ? (
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                className="min-h-[120px] w-full bg-transparent focus:outline-none resize-y"
                placeholder="Description"
                autoFocus
              />
            ) : (
              <div className="min-h-[120px] cursor-pointer whitespace-pre-line">
                {tempDescription || "Description"}
              </div>
            )}
          </div>
        </div>

        <Button
          intent="primary"
          className="mt-4 bg-background w-full font-bold rounded-lg py-2 hover:scale-[1.02] transition-transform"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Card>
    </SectionCard>
  );
};
