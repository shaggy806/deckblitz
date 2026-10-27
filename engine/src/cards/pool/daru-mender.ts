import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 28543.
//
// Rulings:
//   The trigger occurs when you use the Morph ability to turn the card face up, or when an
//     effect turns it face up. It will not trigger on being revealed or on leaving the battlefield.

export default defineCard({
  name: "Daru Mender",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{W}" },
  text: "Morph {W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, regenerate target creature.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "When this creature is turned face up, regenerate target creature.",
    },
  ],
});
