import { supabase } from "../lib/supabase"

export function getResourceStoragePath(fileValue) {
  if (!fileValue) return null

  const value = String(fileValue).trim()

  if (!value.startsWith("http")) {
    return decodeURIComponent(value).replace(/^\/+/, "")
  }

  try {
    const url = new URL(value)
    const markers = [
      "/storage/v1/object/public/resources/",
      "/storage/v1/object/sign/resources/",
    ]

    for (const marker of markers) {
      const index = url.pathname.indexOf(marker)
      if (index !== -1) {
        return decodeURIComponent(url.pathname.substring(index + marker.length)).replace(/^\/+/, "")
      }
    }
  } catch (error) {
    console.error("RESOURCE URL PARSE ERROR:", error)
  }

  return null
}

export async function openResourceFile(fileValue) {
  const filePath = getResourceStoragePath(fileValue)
  const openedWindow = window.open("", "_blank")

  if (!filePath) {
    openedWindow?.close()
    throw new Error("The resource file path is invalid.")
  }

  const { data, error } = await supabase.storage
    .from("resources")
    .createSignedUrl(filePath, 600)

  if (error || !data?.signedUrl) {
    openedWindow?.close()
    throw error || new Error("Unable to generate a secure resource link.")
  }

  if (openedWindow) {
    openedWindow.location.href = data.signedUrl
  } else {
    window.location.href = data.signedUrl
  }
}
