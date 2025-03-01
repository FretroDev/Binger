"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useSettings } from "@/hooks/use-settings"
import { toast } from "@/components/ui/use-toast"

export function DisplayTab() {
  const { settings, updateSettings } = useSettings()

  const handleToggleMovieLogos = () => {
    updateSettings({
      ...settings,
      showMovieLogos: !settings.showMovieLogos,
    })
    toast({
      title: "Settings updated",
      description: `Movie logos are now ${!settings.showMovieLogos ? "enabled" : "disabled"}`,
    })
  }

  return (
    <TabsContent value="display" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Media Display</CardTitle>
          <CardDescription>Customize how media information is displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Movie Logos</Label>
              <p className="text-sm text-muted-foreground">
                Display movie/show logos instead of text titles when available
              </p>
            </div>
            <Switch checked={settings.showMovieLogos} onCheckedChange={handleToggleMovieLogos} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animate Cards</Label>
              <p className="text-sm text-muted-foreground">Enable smooth animations when hovering over media cards</p>
            </div>
            <Switch
              checked={settings.animateCards}
              onCheckedChange={(checked) => {
                updateSettings({ ...settings, animateCards: checked })
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-play Trailers</Label>
              <p className="text-sm text-muted-foreground">Automatically play trailers when hovering over media</p>
            </div>
            <Switch
              checked={settings.autoplayTrailers}
              onCheckedChange={(checked) => {
                updateSettings({ ...settings, autoplayTrailers: checked })
              }}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

