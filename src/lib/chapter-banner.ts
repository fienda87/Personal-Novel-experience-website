export const DEFAULT_CHAPTER_BANNER_URL = '/bg-read.jpg'

export function getChapterBannerUrl(bannerUrl?: string | null) {
  const trimmedUrl = bannerUrl?.trim()
  return trimmedUrl || DEFAULT_CHAPTER_BANNER_URL
}
