import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import GroupsPage from "./pages/GroupsPage.jsx";
import CreateGroupPage from "./pages/CreateGroupPage.jsx";

import DiscoverPage from "./pages/DiscoverPage.jsx";
import PostPage from "./pages/PostPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";



// Inside your <Routes> component:


export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/create" element={<CreateGroupPage />} />




          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}