import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import GroupsPage from "./pages/GroupsPage.jsx";
import CreateGroupPage from "./pages/CreateGroupPage.jsx";
import GroupDetail from "./pages/GroupDetail.jsx";

import DiscoverPage from "./pages/DiscoverPage.jsx";
import PostPage from "./pages/PostPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

import PublicProfilePage from "./pages/PublicProfilePage.jsx";


export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/groups" element={<GroupsPage />} />
          
          {/* 👇 KEEP /groups/create ABOVE /groups/:groupId */}
          <Route path="/groups/create" element={<CreateGroupPage />} />
          
          {/* 👇 DYNAMIC ROUTE COMES AFTER */}
          <Route path="/groups/:groupId" element={<GroupDetail />} />

          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/about" element={<AboutPage />} />
<Route path="/contact" element={<ContactPage />} />
<Route path="/admin" element={<AdminPage />} />

<Route path="/user/:username" element={<PublicProfilePage />} />

        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}