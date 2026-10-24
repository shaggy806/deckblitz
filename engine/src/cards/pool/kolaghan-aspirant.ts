import { defineCard } from "../define.js";

// EDHREC rank 30015.
//
// Rulings:
//   [2015-02-25] The damage Kolaghan Aspirant deals because of its triggered ability isn't
//     combat damage. If that damage causes each creature blocking it to leave combat, Kolaghan
//     Aspirant will remain blocked.
//   [2015-02-25] If Kolaghan Aspirant becomes blocked by multiple creatures, its ability will
//     trigger once for each of them.

const TEXT = "Whenever this creature becomes blocked by a creature, this creature deals 1 damage to that creature.";

export default defineCard({
  name: "Kolaghan Aspirant",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
