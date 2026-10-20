import { defineCard } from "../define.js";

// EDHREC rank 28607.
//
// Rulings:
//   [2020-09-25] If the target creature is an illegal target by the time Synchronized Spellcraft
//     tries to resolve, the spell doesn't resolve. No player is dealt damage.
//
// Both damages are one event (Judgment Bolt's shape).

export default defineCard({
  name: "Synchronized Spellcraft",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Synchronized Spellcraft deals 4 damage to target creature and X damage to that creature's controller, where X is the number of creatures in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "damage", amount: { partySize: "you" }, toControllerOfTarget: 0 },
    ],
  },
});
