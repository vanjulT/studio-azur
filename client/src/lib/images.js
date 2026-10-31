// Free photos from Unsplash (Unsplash License), loaded from their image CDN.
const base = "https://images.unsplash.com/"
const params = "?auto=format&fit=crop&q=70"

export function photo(id, width = 900) {
  return `${base}${id}${params}&w=${width}`
}

export const heroPhoto = "photo-1521590832167-7bcbfaa6381f"
export const authPhoto = "photo-1522337360788-8b13dee7a37e"
export const bookingPhoto = "photo-1600948836101-f9ffda59d250"

const servicePhotos = [
  { match: "women", id: "photo-1634449571010-02389ed0f9b0" },
  { match: "men", id: "photo-1503951914875-452162b0f3f1" },
  { match: "colour", id: "photo-1595475884562-073c30d45670" },
  { match: "color", id: "photo-1595475884562-073c30d45670" },
  { match: "blow", id: "photo-1580618672591-eb180b1a973f" },
  { match: "beard", id: "photo-1599351431202-1e0f0137899a" },
  { match: "kid", id: "photo-1562322140-8baeececf3df" },
]

const fallbackPhoto = "photo-1560869713-7d0a29430803"

// Picks a photo by looking for a keyword in the service name
export function servicePhoto(name = "", width = 700) {
  const lower = name.toLowerCase()
  const found = servicePhotos.find((p) => lower.includes(p.match))
  return photo(found ? found.id : fallbackPhoto, width)
}
