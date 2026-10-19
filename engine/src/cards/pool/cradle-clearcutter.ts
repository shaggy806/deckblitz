import { defineCard } from "../define.js";

// EDHREC rank 8431.
//
// Prototype (rule 718) is `prototype` (Combat Thresher): cast for {2}{G} it's
// a green 1/3 on the stack and the battlefield, a colorless 3/6 everywhere
// else. The mana is Marwyn, the Nurturer's: as much {G} as its power as the
// ability resolves.

const MANA_TEXT = "{T}: Add an amount of {G} equal to this creature's power.";

export default defineCard({
  name: "Cradle Clearcutter",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 6,
  text:
    "Prototype {2}{G} — 1/3 (You may cast this spell with different mana cost, color, and size. " +
    "It keeps its abilities and types.)\n" +
    MANA_TEXT,
  prototype: { cost: "{2}{G}", power: 1, toughness: 3 },
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: { powerOf: "source" } },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
