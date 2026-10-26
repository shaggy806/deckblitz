import { defineCard } from "../define.js";

// EDHREC rank 26763.
//
// Rulings:
//   [2011-01-22] Creature abilities like deathtouch or lifelink may affect the results of the
//     damage dealt.

export default defineCard({
  name: "Wrack with Madness",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target creature deals damage to itself equal to its power.",
  targets: ["creature"],
  effect: { kind: "damage", amount: { powerOf: 0 }, target: 0, from: { target: 0 } },
});
