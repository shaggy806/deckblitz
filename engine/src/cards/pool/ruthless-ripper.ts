import { defineCard } from "../define.js";

// EDHREC rank 13695.
const UP_TEXT = "When this creature is turned face up, target player loses 2 life.";

export default defineCard({
  name: "Ruthless Ripper",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\nMorph—Reveal a black card in your hand.\n${UP_TEXT}`,
  morph: {
    keyword: "morph",
    cost: "",
    also: { reveal: { count: 1, filter: { colors: ["B"] }, text: "black card" } },
    text: "Reveal a black card in your hand",
  },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["player"],
      effect: { kind: "lose-life", amount: 2, target: 0 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
