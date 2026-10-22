import { defineCard } from "../define.js";
import { afflict } from "../helpers.js";

// EDHREC rank 16803.
//
// Rulings:
//   [2017-07-14] The second ability resolves before combat damage is dealt; you must cast the
//     spell then. You can cast a sorcery during the declare blockers step this way.
//   [2017-07-14] If the card has {X} in its mana cost, you must choose 0 as the value of X.
//   [2017-07-14] Additional costs may (or must) be paid; alternative costs can't.

export default defineCard({
  name: "Wildfire Eternal",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Zombie", "Jackal", "Cleric"],
  power: 1,
  toughness: 4,
  text: "Afflict 4 (Whenever this creature becomes blocked, defending player loses 4 life.)\nWhenever this creature attacks and isn't blocked, you may cast an instant or sorcery spell from your hand without paying its mana cost.",
  triggered: [
    afflict(4),
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: { kind: "cast-now", from: "hand", free: true, spell: { typesAnyOf: ["instant", "sorcery"] } },
      resolve: null,
      text: "Whenever this creature attacks and isn't blocked, you may cast an instant or sorcery spell from your hand without paying its mana cost.",
    },
  ],
});
