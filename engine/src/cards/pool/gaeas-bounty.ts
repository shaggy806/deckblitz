import { defineCard } from "../define.js";

// Urza's Saga. Any Forest card, basic or not; finding none is allowed (the ruling).
export default defineCard({
  name: "Gaea's Bounty",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to two Forest cards, reveal those cards, put them into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { type: "land", subtype: "Forest" },
    destination: "hand",
    reveal: true,
    min: 0,
    max: 2,
  },
});
