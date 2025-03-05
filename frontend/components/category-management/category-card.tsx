"use client";

import { Card } from "@/components/ui/card";
import { Edit, X } from 'lucide-react'; 
import type { Category } from "@/lib/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const CategoryCardSection: React.FC<{ 
  category: Category;
  onSave: (updatedCategory: Category) => void; 
}> = ({ category, onSave }) => {
  const [isEditing, setIsEditing] = useState(false); 
  const [tempTitle, setTempTitle] = useState(category.c_title);
  const [tempDesc, setTempDesc] = useState(category.c_description);

  const handleEditClick = () => {
    setIsEditing(true); // Enter edit mode
  };

  const handleSave = () => {
    const updatedCategory = {
      ...category,
      c_title: tempTitle,
      c_description: tempDesc,
    };
    onSave(updatedCategory); // Notify parent of changes
    setIsEditing(false); // Exit edit mode
  };

  const handleCancel = () => {
    setTempTitle(category.c_title);
    setTempDesc(category.c_description);
    setIsEditing(false); // Exit edit mode
  };

  return (
    <>
      <Card
        className="w-full p-4 shadow-lg flex flex-col justify-between transition-all hover:shadow-xl relative"
        style={{
          backgroundColor: category.c_background,
          color: category.c_foreground,
        }}
      >
        {/* Edit Button */}
        <div
          className="absolute top-2 right-2 cursor-pointer p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          onClick={handleEditClick}
        >
          <Edit size={14} color={category.c_foreground} />
        </div>

        <div className="space-y-2">
          {/* Title Section */}
          <div className="p-1">
            <div className="text- font-bold truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {category.c_title || "Title"}
            </div>
          </div>

          {/* Description Section */}
          <div className="p-1">
            <div className="min-h-[60px] overflow-hidden">
              <p className="text-m line-clamp-3 text-ellipsis break-words">
                {category.c_description || "Description"}
              </p>
            </div>
          </div>
        </div>
      </Card>
  

      {isEditing && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-[70vh] h-full max-h-[70vh] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit Category</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCancel} 
            >
              <X className="h-4 w-4" /> 
            </Button>
          </div>

          <div className="flex-1 flex flex-col space-y-4">
            {/* Title Input (1/3 of the card height) */}
            <Label className="flex-[2] flex flex-col">
              <span className="text-sm font-bold mb-1">Title (Max 50 characters)</span>
              <Input
                value={tempTitle}
                onChange={(e) => {
                  if (e.target.value.length <= 50) { // Enforce 50-character limit
                    setTempTitle(e.target.value);
                  }
                }}
                maxLength={50} 
                className="flex-2" 
              />
              <span
                className={`text-xs mt-1 ${
                  tempTitle.length >= 50 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {tempTitle.length}/50 characters
              </span>
            </Label>

            {/* Description Textarea (2/3 of the card height) */}
            <Label className="flex-[9] flex flex-col">
              <span className="text-sm font-bold mb-1">Description (Max 200 characters)</span>
              <Textarea
                value={tempDesc}
                onChange={(e) => {
                  if (e.target.value.length <= 200) { // Enforce 200-character limit
                    setTempDesc(e.target.value);
                  }
                }}
                maxLength={200} // Optional: Enforce a hard character limit
                className="flex-1 resize-none" // Make the textarea fill the available space and disable resizing
              />
              <span
                className={`text-xs mt-1 ${
                  tempDesc.length >= 200 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {tempDesc.length}/200 characters
              </span>
            </Label>

            {/* Save and Cancel Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </Card>
      </div>
    )}
    </>
  );
};