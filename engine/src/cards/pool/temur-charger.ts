import { defineCard } from "../define.js";

// EDHREC rank 18814. The revealed card stays in your hand.
const UP_TEXT = "When this creature is turned face up, target creature gains trample until end of turn.";

export default defineCard({
  name: "Temur Charger",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 3,
  toughness: 1,
  morph: {
    keyword: "morph",
    cost: "",
    also: { reveal: { count: 1, filter: { colors: ["G"] }, text: "green card" } },
    text: "Reveal a green card in your hand",
  },
  text: `Morph—Reveal a green card in your hand. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
