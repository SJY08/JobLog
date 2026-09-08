import React from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider, useAuth } from "@/entities/session"
import { RecordsProvider } from "@/entities/application"
import { ThemeProvider } from "@/shared/providers"
import { AppShell } from "@/widgets/app-shell"
import { LoginPage } from "@/pages/login"
import { PrivacyPage } from "@/pages/privacy"
import { TermsPage } from "@/pages/terms"
import { ApplicationsPage } from "@/pages/applications"
import { ApplicationDetailPage } from "@/pages/application-detail"
import { PortfolioPage } from "@/pages/portfolio"
import { PortfolioPreviewPage } from "@/pages/portfolio-preview"
import { CoverLetterEditorPage } from "@/pages/cover-letter-editor"
import { CoverLetterPreviewPage } from "@/pages/cover-letter-preview"

/**
 * @description 로그인 가드 컴포넌트
 */
function Protected({ children }: { children: React.ReactNode }) {
    const { user, ready } = useAuth()
    if (!ready) return null
    if (!user) return <Navigate to="/login" replace />
    return <AppShell>{children}</AppShell>
}

/**
 * @description 루트 앱 컴포넌트
 */
export function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <RecordsProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/privacy" element={<PrivacyPage />} />
                            <Route path="/terms" element={<TermsPage />} />
                            <Route
                                path="/applications"
                                element={
                                    <Protected>
                                        <ApplicationsPage />
                                    </Protected>
                                }
                            />
                            <Route
                                path="/applications/new"
                                element={
                                    <Protected>
                                        <ApplicationDetailPage />
                                    </Protected>
                                }
                            />
                            <Route
                                path="/applications/:id"
                                element={
                                    <Protected>
                                        <ApplicationDetailPage />
                                    </Protected>
                                }
                            />
                            <Route
                                path="/portfolio"
                                element={
                                    <Protected>
                                        <PortfolioPage />
                                    </Protected>
                                }
                            />
                            <Route
                                path="/portfolio/preview/:id"
                                element={
                                    <Protected>
                                        <PortfolioPreviewPage />
                                    </Protected>
                                }
                            />
                            <Route
                                path="/cover-letter"
                                element={
                                    <Protected>
                                        <CoverLetterEditorPage />
                                    </Protected>
                                }
                            />
                            <Route
                                path="/cover-letter/preview"
                                element={
                                    <Protected>
                                        <CoverLetterPreviewPage />
                                    </Protected>
                                }
                            />
                            <Route path="*" element={<Navigate to="/applications" replace />} />
                        </Routes>
                    </BrowserRouter>
                </RecordsProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}
