"use client"

import Landing from "@/components/widgets/mainpage"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ChatCanvas from "@/app/[id]/page"
import CategoryManagement from "@/components/category-management/category-managmer"

export default function Home() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/:id" element={<ChatCanvas />} /> {/* Dynamic route for conversation id */}
        <Route path="/category-management" element={<CategoryManagement  onEdit={() => {}}/>} />
      </Routes>
    </Router>
  );
}
