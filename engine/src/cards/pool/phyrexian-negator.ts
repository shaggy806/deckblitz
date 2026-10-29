import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Sacrificing this card does not prevent you from having to make the other
//     sacrifices.

export default defineCard({
  name: "Phyrexian Negator",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nWhenever this creature is dealt damage, sacrifice that many permanents.",
  triggered: [
    {
      // "That many": the damage dealt (the trigger's value), of any permanents you control.
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: {}, count: { triggerValue: true } },
      resolve: null,
      text: "Whenever this creature is dealt damage, sacrifice that many permanents.",
    },
  ],
});
