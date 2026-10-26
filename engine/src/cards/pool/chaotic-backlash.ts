import { defineCard } from "../define.js";

// EDHREC rank 28960. Counted from the target player's side (`forTarget`).
//
// Rulings:
//   [2008-08-01] Each permanent is counted only once. For example, if the targeted player
//     controls a white creature, a blue enchantment, and a white-blue creature, Chaotic Backlash
//     will deal 6 damage to that player.

export default defineCard({
  name: "Chaotic Backlash",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Chaotic Backlash deals damage to target player equal to twice the number of white and/or blue permanents they control.",
  targets: ["player"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      countOf: { controlledBy: "you", anyOf: [{ colors: ["W"] }, { colors: ["U"] }] },
      forTarget: 0,
      times: 2,
    },
  },
});
