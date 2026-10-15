import { defineCard } from "../define.js";

// Rulings:
//   The total cost starts from the mana cost or alternative cost being paid,
//   adds increases, then applies reductions; the mana value stays 5 whatever
//   was paid. Focus the Mind's shape: the spell being cast isn't yet among
//   the spells you've cast this turn as its cost is determined.

export default defineCard({
  name: "Gigastorm Titan",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: "This spell costs {3} less to cast if you've cast another spell this turn.",
  selfCostReduction: {
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
    reduceGeneric: 3,
  },
});
