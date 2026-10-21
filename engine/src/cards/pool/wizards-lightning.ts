import { defineCard } from "../define.js";

// EDHREC rank 8566. Dominaria.
//
// Rulings:
//   [2018-04-27] Once you announce that you're casting Wizard's Lightning, no player may take
//     other actions until the spell's been paid for. Notably, players can't try to raise the
//     spell's cost by removing your Wizards.

export default defineCard({
  name: "Wizard's Lightning",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if you control a Wizard.\nWizard's Lightning deals 3 damage to any target.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1 },
    reduceGeneric: 2,
  },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
