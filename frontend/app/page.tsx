"use client"

import Landing from "@/components/widgets/mainpage"
import 'normalize.css/normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ChatCanvas from "@/app/[id]/page"
import CategoryManagement from "@/components/category-management/category-managmer"

export default function Home() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/:id" element={<ChatCanvas />} /> {/* Dynamic route for conversation id */}
        <Route path="/category-management" element={<CategoryManagement />} />
      </Routes>
    </Router>
  );
}
