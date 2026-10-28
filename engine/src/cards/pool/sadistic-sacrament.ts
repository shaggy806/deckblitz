import { defineCard } from "../define.js";

// EDHREC rank 16650. Kicked, the search is for up to fifteen instead of up to
// three — one search either way.

const SEARCH = (max: number) =>
  ({ kind: "search-library", whose: { target: 0 }, filter: {}, destination: "exile", min: 0, max }) as const;

export default defineCard({
  name: "Sadistic Sacrament",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker {7} (You may pay an additional {7} as you cast this spell.)\nSearch target player's library for up to three cards, exile them, then that player shuffles. If this spell was kicked, instead search that player's library for up to fifteen cards, exile them, then that player shuffles.",
  targets: ["player"],
  effect: SEARCH(3),
  kicker: { cost: "{7}", targets: ["player"], effect: SEARCH(15) },
});
