import { defineCard } from "../define.js";

// EDHREC rank 10234. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] If either target becomes illegal before Inspired Ultimatum resolves, the other
//     will be affected as appropriate and you'll draw five cards. If both targets become illegal,
//     the spell won't resolve and you won't draw five cards.
//   [2020-04-17] You can target yourself as the player to gain 5 life.

export default defineCard({
  name: "Inspired Ultimatum",
  manaCost: "{U}{U}{R}{R}{R}{W}{W}",
  colors: ["W", "U", "R"],
  types: ["sorcery"],
  text: "Target player gains 5 life, Inspired Ultimatum deals 5 damage to any target, then you draw five cards.",
  targets: ["player", "any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 5, toControllerOfTarget: 0 },
      { kind: "damage", amount: 5, target: 1 },
      { kind: "draw", amount: 5 },
    ],
  },
});
