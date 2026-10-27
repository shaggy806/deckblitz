import { defineCard } from "../define.js";

// EDHREC rank 20267.

export default defineCard({
  name: "Fathom Seer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 3,
  morph: {
    keyword: "morph",
    cost: "",
    also: { returnToHand: { count: 2, filter: { subtype: "Island" } } },
    text: "Return two Islands you control to their owner's hand",
  },
  text: "Morph—Return two Islands you control to their owner's hand. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, draw two cards.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "When this creature is turned face up, draw two cards.",
    },
  ],
});
