import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import ArticlesPage from '../pages/public/ArticlesPage';
import ArticlePage from '../pages/public/ArticlePage';
import ArchivePage from '../pages/public/ArchivePage';
import NewspapersPage from '../pages/public/NewspapersPage';
import NewspaperDetailPage from '../pages/public/NewspaperDetailPage';
import AuthorPage from '../pages/public/AuthorPage';
import CategoriesPage from '../pages/public/CategoriesPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Dashboard Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import ArticlesManagement from '../pages/dashboard/ArticlesManagement';
import CreateArticle from '../pages/dashboard/CreateArticle';
import EditArticle from '../pages/dashboard/EditArticle';
import PublishersManagement from '../pages/dashboard/PublishersManagement';
import AuthorsManagement from '../pages/dashboard/AuthorsManagement';
import CategoriesManagement from '../pages/dashboard/CategoriesManagement';
import CommentsManagement from '../pages/dashboard/CommentsManagement';
import UsersManagement from '../pages/dashboard/UsersManagement';
import MediaLibrary from '../pages/dashboard/MediaLibrary';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage';
import SettingsPage from '../pages/dashboard/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/newspapers" element={<NewspapersPage />} />
        <Route path="/newspapers/:slug" element={<NewspaperDetailPage />} />
        <Route path="/authors" element={<AuthorPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Auth Pages */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Dashboard Management (Protected) */}
      <Route path="/dashboard" element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="articles" element={<ArticlesManagement />} />
          <Route path="articles/create" element={<CreateArticle />} />
          <Route path="articles/edit/:id" element={<EditArticle />} />
          <Route path="publishers" element={<PublishersManagement />} />
          <Route path="authors" element={<AuthorsManagement />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="comments" element={<CommentsManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
