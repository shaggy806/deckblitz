import { defineCard } from "../define.js";

// EDHREC rank 24880. Judgment Bolt's two damages as one event; the controller
// is read off the target (as it last existed, if it's gone by then).
const TEXT =
  "Unleash Shell deals 5 damage to target creature or planeswalker and 2 damage to that permanent's controller.";

export default defineCard({
  name: "Unleash Shell",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
