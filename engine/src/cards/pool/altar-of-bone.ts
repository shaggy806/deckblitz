import { defineCard } from "../define.js";

export default defineCard({
  name: "Altar of Bone",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nSearch your library for a creature card, reveal it, put it into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "creature" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
});
