import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 17949.
//
// Rulings:
//   [2006-02-01] If you cast an instant or sorcery spell that has {X} in its mana cost, the value
//     of X in the spell's replicate cost will be the same as the value of X you chose for its mana
//     cost.
//   [2006-02-01] If you cast a spell that already has replicate while you have this creature on
//     the battlefield, the spell will have two replicate abilities: one with a replicate cost as
//     printed on it, and one with a replicate cost equal to its mana cost. (In this set, both
//     costs are always the same.) You may use either ability, or both abilities, to replicate the
//     spell.

export default defineCard({
  name: "Djinn Illuminatus",
  manaCost: "{5}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: "({U/R} can be paid with either {U} or {R}.)\nFlying\nEach instant and sorcery spell you cast has replicate. The replicate cost is equal to its mana cost. (When you cast it, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)",
  // TODO(scaffold): Each instant and sorcery spell you cast has replicate. The replicate cost is equal to its mana cost.
});
