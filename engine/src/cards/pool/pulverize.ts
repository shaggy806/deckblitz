import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 25878. Fireblast's alternative cost.

export default defineCard({
  name: "Pulverize",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "land", subtype: "Mountain" }, count: 2, text: "two Mountains" },
  },
  text: "You may sacrifice two Mountains rather than pay this spell's mana cost.\nDestroy all artifacts.",
  effect: { kind: "destroy-all", filter: { type: "artifact" } },
});
