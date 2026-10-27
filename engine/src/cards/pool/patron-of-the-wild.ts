import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 27975.

export default defineCard({
  name: "Patron of the Wild",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{2}{G}" },
  text: "Morph {2}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, target creature gets +3/+3 until end of turn.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature is turned face up, target creature gets +3/+3 until end of turn.",
    },
  ],
});
