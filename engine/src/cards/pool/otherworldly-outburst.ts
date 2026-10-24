import { defineCard } from "../define.js";

// EDHREC rank 15100.
// Makes Eldrazi Horror → "Eldrazi Horror Token".
//
// Rulings:
//   [2016-07-13] If the targeted creature doesn’t die this turn, the delayed triggered ability
//     simply won’t trigger.
//   [2016-07-13] If the targeted creature dies before Otherworldly Outburst resolves, the spell
//     doesn’t resolve. You won’t get an Eldrazi Horror token.
//
// Make Your Mark's delayed dies-trigger; the Horror is the spell's
// controller's, whoever controlled the creature.
export default defineCard({
  name: "Otherworldly Outburst",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +1/+0 until end of turn. When that creature dies this turn, create a 3/2 colorless Eldrazi Horror creature token.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "create-token", token: "Eldrazi Horror Token", count: 1 },
        text: "When that creature dies this turn, create a 3/2 colorless Eldrazi Horror creature token.",
      },
    ],
  },
});
