"use client";

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Edit, Info, Minimize2 } from 'lucide-react'
import type { Category } from "@/lib/types"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export const CategoryCardSection: React.FC<{
  category: Category;
  saveEdit: (updatedCategory: Category) => void;
}> = ({ category, saveEdit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tempTitle, setTempTitle] = useState(category.cat_title)
  const [tempDesc, setTempDesc] = useState(category.cat_description)
  const [active, setActive] = useState(category.cat_active ?? false)
  const [tempEventPrefix, setTempEventPrefix] = useState(category.cat_event_prefix ?? "")

  const handleEditClick = () => {
    setIsEditing(true); // Enter edit mode
  };

  const handleSave = () => {
    const updatedCategory = {
      ...category,
      cat_title: tempTitle,
      cat_description: tempDesc,
      cat_active: active,
      cat_event_prefix: tempEventPrefix,
    }

    saveEdit(updatedCategory);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(category.cat_title);
    setTempDesc(category.cat_description);
    setIsEditing(false);
  };

  return (
    <>
      <Card
        className="w-full p-4 shadow-lg flex flex-col justify-between transition-all hover:shadow-xl relative"
        style={{
          backgroundColor: category.cat_background,
          color: category.cat_foreground,
        }}
      >
        {/* Edit Button */}
        <div
          className="absolute top-2 right-2 cursor-pointer p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          onClick={handleEditClick}
        >
          <Edit size={14} color={category.cat_foreground} />
        </div>

        <div className="space-y-2">
          {/* Title Section */}
          <div className="p-1">
            <div className="text- font-bold truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {category.cat_title || "Title"}
            </div>
          </div>

          {/* Description Section */}
          <div className="p-1">
            <div className="min-h-[60px] overflow-hidden">
              <p className="text-m line-clamp-3 text-ellipsis break-words">
                {category.cat_description || "Description"}
              </p>
            </div>
          </div>
        </div>
      </Card>


      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-[80vh] h-full max-h-[80vh] p-6 flex flex-col">
            <div className="flex-1 flex flex-col space-y-4">
              {/* Title Input */}
              <Label className="flex flex-col p-3 relative">
                <Input
                  value={tempTitle}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) setTempTitle(e.target.value);
                  }}
                  placeholder="Category Title..."
                  maxLength={50}
                  className="border-none focus:ring-0 bg-transparent p-0 mt-4 h-auto"
                  style={{ fontSize: "2.25rem", fontWeight: "bold" }}
                />
                <Minimize2 />
                <span className={'text-xs mt-2 flex justify-end'}>
                  <span className={`${tempTitle.length >= 50 ? "text-red-500" : "text-gray-500"}`}>{tempTitle.length}/50</span>
                  <span title="Provide a category title for all events in this color category."><Info className="h-4 w-4 ml-1 text-gray-400" /></span>
                </span>

                <div className="flex items-center gap-2">
                  {/* Current Color Section */}
                  <div className="inline-flex items-center gap-2 border p-2 justify-center w-[25%] h-full">
                    <span className="text-sm font-medium">Current Color:</span>
                    <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: category.cat_background }}></div>
                  </div>

                  {/* Active Toggle Switch */}
                  <div className="inline-flex items-center gap-2 border p-2 justify-center w-[25%] h-full">
                    <Switch
                      checked={active} // Bind the switch to the active state
                      onCheckedChange={() => setActive((prev) => !prev)} // Toggle active state
                    />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              </Label>

              {/* Description Textarea */}
              <Label className="flex flex-col p-3 relative">
                <span className="text-base font-bold">Description</span>
                <Textarea
                  value={tempDesc}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) setTempDesc(e.target.value);
                  }}
                  placeholder="Your description..."
                  maxLength={200}
                  className="border-none focus:ring-0 bg-transparent p-0 mt-4 resize-none"
                />
                <span className={`text-xs mt-2 flex justify-end ${tempDesc.length >= 200 ? "text-red-500" : "text-gray-500"}`}>
                  {tempDesc.length}/200
                  <span title="Provide a clearer description to improve AI agent actions."><Info className="h-4 w-4 text-gray-400 ml-1" /></span>
                </span>
              </Label>

              {/* Event Name Prefix Textarea */}
              <Label className="flex flex-col p-3 relative">
                <span className="text-base font-bold">Event Name Prefix</span>
                <Input
                  value={tempEventPrefix}
                  onChange={(e) => {
                    if (e.target.value.length <= 10) setTempEventPrefix(e.target.value);
                  }}
                  placeholder='Prefix for the events in this category. E.g. "[ASU]" -> [ASU] Capstone Project Meeting'
                  maxLength={10}
                  className="border-none focus:ring-0 bg-transparent p-0 mt-4 h-auto"
                />
                <span className={'text-xs mt-2 flex justify-end'}>
                  <span className={`${tempEventPrefix.length >= 10 ? "text-red-500" : "text-gray-500"}`}>{tempEventPrefix.length}/10</span>
                  <span title="Provide a prefix for all events' names in this color category."><Info className="h-4 w-4 ml-1 text-gray-400" /></span>
                </span>
              </Label>

              {/* Example Tags Inputs */}
              <Label className="flex flex-col p-3 relative">
                <span className="text-base font-bold">Example Events Names</span>
                <Input
                  placeholder='This feature is coming soon.'
                  className="border-none focus:ring-0 bg-transparent p-0 mt-4 h-auto"
                  disabled={true}
                />
                <span className={'text-xs mt-2 flex justify-end'}>
                  <span title="Provide list of events' name that should be added into this category. This would provide some clear context on similar events in this category for the AI agent."><Info className="h-4 w-4 ml-1 text-gray-400" /></span>
                </span>
              </Label>
            </div>

            {/* Save and Cancel Buttons */}
            <div className="relative">
              <div className="absolute bottom-0 right-0 flex gap-2 max-w-[30%] w-full">
                <Button variant="ghost" onClick={handleCancel} className="flex-1">Cancel</Button>
                <Button style={{ backgroundColor: category.cat_background }} onClick={handleSave} className="flex-1 text-black">Save</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
