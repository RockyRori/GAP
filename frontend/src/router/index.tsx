import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { PageContainer } from "../components/layout/PageContainer";
import { HomePage } from "../pages/HomePage";
import { UploadPage } from "../pages/UploadPage";
import { EvaluationPage } from "../pages/EvaluationPage";
import { ReportPage } from "../pages/ReportPage";
import { AboutPage } from "../pages/AboutPage";

export const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Header />
      <PageContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </PageContainer>
      <Footer />
    </HashRouter>
  );
};
