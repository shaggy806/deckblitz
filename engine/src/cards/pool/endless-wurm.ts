import { defineCard } from "../define.js";

// EDHREC rank 27589.
//
// Rulings:
//   [2004-10-04] You choose whether to sacrifice an enchantment or not on resolution. If not, then
//     you sacrifice this card. You can choose to not sacrifice an enchantment if you no longer
//     control this card on resolution.

const TEXT = "At the beginning of your upkeep, sacrifice this creature unless you sacrifice an enchantment.";

export default defineCard({
  name: "Endless Wurm",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 9,
  toughness: 9,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "enchantment" }, text: "Sacrifice an enchantment" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
