import { defineCard } from "../define.js";

// EDHREC rank 23262. Secrets of Strixhaven.
//
// Converge reads the colours of mana spent to cast it, which the permanent
// keeps from the stack: a free cast, or one that never was cast, reads 0, so
// only a mana value 0 permanent can be exiled then (the converge rulings). The
// target's mana value is re-read as the target is rechecked on resolution.
const CONVERGE_TEXT =
  "Converge — When this creature enters, exile target nonland permanent an opponent controls with mana value less than or equal to the number of colors of mana spent to cast this creature.";
const BOTTOM_TEXT = "{2}: Put target card from a graveyard on the bottom of its owner's library.";

export default defineCard({
  name: "Sundering Archaic",
  manaCost: "{6}",
  colors: [],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 3,
  toughness: 3,
  text: `${CONVERGE_TEXT}\n${BOTTOM_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: BOTTOM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { notTypes: ["land"], manaValue: { op: "lte", n: { amount: { colorsSpentOf: "source" } } } },
        },
      ],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: CONVERGE_TEXT,
    },
  ],
});
