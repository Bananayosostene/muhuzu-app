import { toast } from 'sonner'

/**
 * Opens a private file whose link has to be requested first (it lasts five minutes and is never stored).
 * The tab is opened before the request, while the click still counts, so the browser does not block it.
 */
export async function openLink(load: () => Promise<{ url: string }>) {
  const tab = window.open('', '_blank')
  try {
    const { url } = await load()
    if (tab) {
      tab.opener = null
      tab.location.href = url
    }
  } catch (error) {
    tab?.close()
    toast.error(error instanceof Error ? error.message : 'The file could not be opened.')
  }
}
