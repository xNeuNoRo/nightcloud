import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import DirectoryView from "@/views/DirectoryView";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DirectoryView />} index />
          <Route path="/:nodeId" element={<DirectoryView />} index />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
