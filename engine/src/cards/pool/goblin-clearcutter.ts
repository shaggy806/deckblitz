import { defineCard } from "../define.js";

// EDHREC rank 29445. Orcish Lumberjack's ability.
//
// Rulings:
//   [2004-10-04] The ability can grant {G}{G}{G}, {R}{G}{G}, {R}{R}{G}, or {R}{R}{R}.

export default defineCard({
  name: "Goblin Clearcutter",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 3,
  text: "{T}, Sacrifice a Forest: Add three mana in any combination of {R} and/or {G}.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Forest" } } },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 3 },
      resolve: null,
      text: "{T}, Sacrifice a Forest: Add three mana in any combination of {R} and/or {G}.",
    },
  ],
});
