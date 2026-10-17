import { defineCard } from "../define.js";

// EDHREC rank 10219.
//
// Rulings:
//   [2023-06-16] Wizard's Rockets last ability triggers no matter how it's put into a graveyard
//     from the battlefield.
//   [2023-06-16] You must choose the colors of mana Wizard's Rockets produces before its last
//     ability has you draw a card.

export default defineCard({
  name: "Wizard's Rockets",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters tapped.\n{X}, {T}, Sacrifice this artifact: Add X mana in any combination of colors.\nWhen this artifact is put into a graveyard from the battlefield, draw a card.",
  activated: [
    {
      cost: { mana: "{X}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: "x" },
      resolve: null,
      text: "{X}, {T}, Sacrifice this artifact: Add X mana in any combination of colors.",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this artifact is put into a graveyard from the battlefield, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
