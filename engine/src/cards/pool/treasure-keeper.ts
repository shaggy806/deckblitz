import { defineCard } from "../define.js";

// Plargg, Dean of Chaos's dig on a dies trigger: `reveal-until` without
// exiling, the find offered as a free `cast-now` (X is 0 — rule 107.3b), and
// every revealed card still in the library, the found one too when it isn't
// cast, to the bottom in a random order.
const DIES =
  "When this creature dies, reveal cards from the top of your library until you reveal a nonland card with mana value 3 or less. You may cast that card without paying its mana cost. Put all revealed cards not cast this way on the bottom of your library in a random order.";

export default defineCard({
  name: "Treasure Keeper",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 3,
  text: DIES,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"], manaValue: { op: "lte", n: 3 } },
        then: { kind: "cast-now", target: 0, free: true },
        rest: "bottom-random",
      },
      resolve: null,
      text: DIES,
    },
  ],
});
