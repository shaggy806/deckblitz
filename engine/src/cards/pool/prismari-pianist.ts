import { defineCard } from "../define.js";

// EDHREC rank 9400. Secrets of Strixhaven Commander.
//
// "That spell's mana value" is the spell's on the stack, {X} as chosen — or
// as it last was there, if it was countered before this resolved (the
// rulings). Opus's shape, over mana value instead of mana spent.
const TEXT =
  "Whenever you cast an instant or sorcery spell, create a 1/1 blue and red Elemental creature token. If that spell's mana value is 5 or greater, create three of those tokens instead.";

export default defineCard({
  name: "Prismari Pianist",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Djinn", "Bard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { manaValue: { op: "gte", n: 5 } } },
        then: { kind: "create-token", token: "Elemental Token (Prismari Pianist)", count: 3 },
        else: { kind: "create-token", token: "Elemental Token (Prismari Pianist)", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
