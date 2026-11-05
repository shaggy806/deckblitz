import { defineCard } from "../define.js";

// EDHREC rank 18439. The revealed card stays in your hand.
const UP_TEXT = "When this creature is turned face up, look at target opponent's hand.";

export default defineCard({
  name: "Dragon's Eye Savants",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 6,
  morph: {
    keyword: "morph",
    cost: "",
    also: { reveal: { count: 1, filter: { colors: ["U"] }, text: "blue card" } },
    text: "Reveal a blue card in your hand",
  },
  text: `Morph—Reveal a blue card in your hand. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["opponent"],
      effect: { kind: "look-at-hand", target: 0 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
