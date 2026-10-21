import { defineCard } from "../define.js";

// Whether you control a Nissa planeswalker is checked only as it resolves
// (the ruling).
export default defineCard({
  name: "Nissa's Triumph",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to two basic Forest cards. If you control a Nissa planeswalker, instead search your library for up to three land cards. Reveal those cards, put them into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Nissa" }, atLeast: 1 },
    then: { kind: "search-library", filter: { type: "land" }, destination: "hand", reveal: true, min: 0, max: 3 },
    else: {
      kind: "search-library",
      filter: { supertype: "basic", type: "land", subtype: "Forest" },
      destination: "hand",
      reveal: true,
      min: 0,
      max: 2,
    },
  },
});
