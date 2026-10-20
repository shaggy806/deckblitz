import { defineCard } from "../define.js";

// Rulings:
//   [2022-02-18] Gaining control of a permanent doesn't cause you to gain control of any Auras or
//     Equipment attached to that permanent.
//   [2022-02-18] You will not be able to attack with the creature you gain control of or use its
//     activated abilities with {T} in the cost unless it has haste.

export default defineCard({
  name: "Invoke the Winds",
  manaCost: "{1}{U}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Gain control of target artifact or creature. Untap it.",
  targets: ["artifact-or-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: false },
      { kind: "untap", target: 0 },
    ],
  },
});
