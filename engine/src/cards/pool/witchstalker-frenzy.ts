import { defineCard } from "../define.js";

// EDHREC rank 15423.
//
// Rulings:
//   [2023-09-01] Witchstalker Frenzy's first ability can't reduce its cost to less than {R}.
//   [2023-09-01] Witchstalker Frenzy's first ability doesn't change its mana cost or mana value,
//     only the total cost you pay. Specifically, the mana value of Witchstalker Frenzy is always 4.
//
// Rowdy Research's reduction: every creature declared as an attacker this
// turn, by any player; it reduces only the generic part.

const COST_TEXT = "This spell costs {1} less to cast for each creature that attacked this turn.";

export default defineCard({
  name: "Witchstalker Frenzy",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${COST_TEXT}\nWitchstalker Frenzy deals 5 damage to target creature.`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "attackers", who: "any-player" },
  },
  targets: ["creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
});
