import { defineCard } from "../define.js";

// EDHREC rank 27131.
//
// Rulings:
//   [2013-04-15] An ability that triggers when something "attacks and isn't blocked" triggers in
//     the declare blockers step after blockers are declared if (1) that creature is attacking and
//     (2) no creatures are declared to block it.
//
// Farrel's Zealot's shape, the damage its power as the ability resolves.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may have it deal damage equal to its power to target creature. If you do, this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Dwarven Vigilantes",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Dwarven Vigilantes deal damage equal to its power to the targeted creature? It then assigns no combat damage.",
        effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
        then: { kind: "assigns-no-combat-damage", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
