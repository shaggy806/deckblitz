import { defineCard } from "../define.js";

// EDHREC rank 28029.
//
// Rulings:
//   [2004-10-04] The trigger occurs when you use the Morph ability to turn the card face up, or
//     when an effect turns it face up. It will not trigger on being revealed or on leaving the
//     battlefield.

const TEXT = "When this creature is turned face up, it deals 2 damage to any target.";

export default defineCard({
  name: "Skirk Marauder",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  morph: { keyword: "morph", cost: "{2}{R}" },
  text: `Morph {2}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
