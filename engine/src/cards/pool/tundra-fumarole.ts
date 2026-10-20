import { defineCard } from "../define.js";

// EDHREC rank 23037.
//
// One {C} for each mana from a snow source spent to cast it (rule 107.4h) —
// none for a copy, or cast without snow mana (the rulings). The mana stays
// as steps and phases end, until the turn does (Savage Ventmaw's
// `persists`). With its target gone it doesn't resolve, and adds nothing.
export default defineCard({
  name: "Tundra Fumarole",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["snow"],
  types: ["sorcery"],
  text: "Tundra Fumarole deals 4 damage to target creature or planeswalker. Add {C} for each {S} spent to cast this spell. Until end of turn, you don't lose this mana as steps and phases end. ({S} is mana from a snow source.)",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      {
        kind: "add-mana",
        mana: "C",
        amount: { manaSpentOf: "source", from: { supertype: "snow" } },
        persists: true,
      },
    ],
  },
});
