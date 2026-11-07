import { useEffect, useState } from "react"

/**
 * Track a CSS media query from React.
 *
 * The list views show a table on a wide screen and a card list on a narrow one.
 * Only one of the two is mounted, so a phone never carries the markup of a
 * table it cannot show and the wide screen never carries a second copy of
 * every row.
 *
 * The initial value is read during the first render, so the view never paints
 * the wrong one first.
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)

    list.addEventListener("change", onChange)

    return () => list.removeEventListener("change", onChange)
  }, [query])

  return matches
}
