import { defineCard } from "../define.js";

// EDHREC rank 15306.
//
// Rulings:
//   [2020-09-25] If the target creature is an illegal target by the time Chilling Trap tries to
//     resolve, the spell doesn't resolve. You don't draw a card if you control a Wizard.

export default defineCard({
  name: "Chilling Trap",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature gets -4/-0 until end of turn. If you control a Wizard, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -4, toughness: 0, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
