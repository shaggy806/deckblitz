import { defineCard } from "../define.js";

// EDHREC rank 14326. Marvel Super Heroes Commander.
//
// The intervening-if is H.E.R.B.I.E.'s `cast-this-turn` over noncreature
// spells, each read as it was cast. Discover 6 (rule 701.57a) is Hidden
// Volcano's shape: exile until a nonland card with mana value 6 or less, cast
// it free or put it into your hand (where it also goes if it can't be cast —
// the discover rulings), the rest on the bottom in a random order.
const TEXT =
  "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, discover 6. (Exile cards from the top of your library until you exile a nonland card with mana value 6 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)";

export default defineCard({
  name: "Franklin Richards, Ascendant",
  manaCost: "{5}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"], manaValue: { op: "lte", n: 6 } },
        exile: true,
        keepFound: true,
        rest: "bottom-random",
        then: {
          kind: "cast-now",
          target: 0,
          free: true,
          spell: { manaValue: { op: "lte", n: 6 } },
          else: { kind: "return-to-hand", target: 0, from: "exile" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
