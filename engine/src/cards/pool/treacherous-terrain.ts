import { defineCard } from "../define.js";

// Each opponent is dealt damage equal to the lands *they* control — the count
// read once per opponent, from their side (Typhoon's shape).
export default defineCard({
  name: "Treacherous Terrain",
  manaCost: "{6}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Treacherous Terrain deals damage to each opponent equal to the number of lands that player controls.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  effect: {
    kind: "damage",
    who: "each-opponent",
    amount: { countOf: { type: "land", controlledBy: "you" }, forEachPlayer: true },
  },
});
