import { defineCard } from "../define.js";

// EDHREC rank 30101. The revealed card stays in your hand.
const UP_TEXT = "When this creature is turned face up, you gain 2 life.";

export default defineCard({
  name: "Watcher of the Roost",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\nMorph—Reveal a white card in your hand.\n${UP_TEXT}`,
  morph: {
    keyword: "morph",
    cost: "",
    also: { reveal: { count: 1, filter: { colors: ["W"] }, text: "white card" } },
    text: "Reveal a white card in your hand",
  },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
