"use client"
import { motion } from "framer-motion"
import { ThemeProvider } from "@/components/theme-provider"
import { NavBar } from "@/components/nav-bar"
import ErrorBoundary from "@/components/error-boundary"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings2, Eye, Layout, Database } from "lucide-react"
import { DisplayTab } from "@/components/settings/display-tab"
import { AppearanceTab } from "@/components/settings/appearance-tab"
import { DataTab } from "@/components/settings/data-tab"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <motion.div
          className="min-h-screen bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container py-10">
            <NavBar onAddMedia={async () => {}} />

            <div className="grid gap-6">
              <div className="flex items-center space-x-2">
                <Settings2 className="h-5 w-5" />
                <h1 className="text-2xl font-semibold">Settings</h1>
              </div>

              <Tabs defaultValue="display" className="space-y-4">
                <div className="overflow-x-auto">
                  <TabsList className="p-0 h-auto bg-background gap-1 inline-flex w-full sm:w-auto">
                    <TabsTrigger
                      value="display"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                    >
                      <Layout className="h-4 w-4" />
                      <span className="hidden sm:inline">Display</span>
                      <span className="sm:hidden">View</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="appearance"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Appearance</span>
                      <span className="sm:hidden">Look</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="data"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                    >
                      <Database className="h-4 w-4" />
                      <span className="hidden sm:inline">Data</span>
                      <span className="sm:hidden">Data</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <AppearanceTab />
                <DisplayTab />
                <DataTab />
              </Tabs>
            </div>
          </div>
        </motion.div>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

