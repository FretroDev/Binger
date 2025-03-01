"use client"

import { useState, useEffect } from "react"
import { getStoredSettings, storeSettings } from "@/lib/settings"
import type { Settings } from "@/types"

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(getStoredSettings())

  useEffect(() => {
    const storedSettings = getStoredSettings()
    setSettings(storedSettings)
  }, [])

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)
    storeSettings(newSettings)
  }

  return {
    settings,
    updateSettings,
  }
}

