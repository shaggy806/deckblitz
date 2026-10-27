import { defineCard } from "../define.js";

// EDHREC rank 14051.

export default defineCard({
  name: "Root Elemental",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 5,
  morph: { keyword: "morph", cost: "{5}{G}{G}" },
  text: "Morph {5}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, you may put a creature card from your hand onto the battlefield.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
      },
      resolve: null,
      text: "When this creature is turned face up, you may put a creature card from your hand onto the battlefield.",
    },
  ],
});
