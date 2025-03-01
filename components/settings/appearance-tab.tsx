"use client"

import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"

export function AppearanceTab() {
  const { theme, setTheme } = useTheme()

  return (
    <TabsContent value="appearance" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription className="hidden sm:block">Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "light", icon: Sun, label: "Light" },
              { id: "dark", icon: Moon, label: "Dark" },
              { id: "system", icon: Monitor, label: "System" },
            ].map((option) => {
              const Icon = option.icon
              const isSelected = theme === option.id

              return (
                <Card
                  key={option.id}
                  className={`relative cursor-pointer transition-all duration-300 rounded-lg
                    ${
                      isSelected
                        ? "border-2 border-primary shadow-md shadow-primary/30"
                        : "border border-border hover:border-primary/70"
                    } 
                    hover:scale-[1.02] active:scale-[0.98]
                  `}
                  onClick={() => setTheme(option.id)}
                >
                  <CardContent className="p-5 flex flex-col items-center gap-3">
                    <div
                      className={`p-3 rounded-full transition-all duration-300
                        ${
                          isSelected
                            ? "bg-primary text-primary-foreground ring-4 ring-primary ring-offset-2 ring-offset-background"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium">{option.label}</h3>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

