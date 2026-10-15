import { defineCard } from "../define.js";

// EDHREC rank 14755. Shocker, Unshakable's two damages as one event.
// Rulings:
//   [2025-06-06] The value of X is calculated only once, as Judgment Bolt resolves.

export default defineCard({
  name: "Judgment Bolt",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Judgment Bolt deals 5 damage to target creature and X damage to that creature's controller, where X is the number of Equipment you control.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "damage",
        amount: { countOf: { subtype: "Equipment", controlledBy: "you" } },
        toControllerOfTarget: 0,
      },
    ],
  },
});
