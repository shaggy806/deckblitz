import { defineCard } from "../define.js";

// "If it has the same name as a permanent": only those are offered (rule
// 201.2a — a split card's either name).
export default defineCard({
  name: "Mitotic Manipulation",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top seven cards of your library. You may put one of those cards onto the battlefield if it has the same name as a permanent. Put the rest on the bottom of your library in any order.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    min: 0,
    max: 1,
    filter: { sameNameWith: { permanents: {} } },
    destination: "battlefield",
    leftover: "bottom-any-order",
  },
});
