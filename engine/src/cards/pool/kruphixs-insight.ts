import { defineCard } from "../define.js";

export default defineCard({
  name: "Kruphix's Insight",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top six cards of your library. Put up to three enchantment cards from among them into your hand and the rest of the revealed cards into your graveyard.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 6,
    reveal: true,
    min: 0,
    max: 3,
    filter: { type: "enchantment" },
    destination: "hand",
    leftover: "graveyard",
  },
});
