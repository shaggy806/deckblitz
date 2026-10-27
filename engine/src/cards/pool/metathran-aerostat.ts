import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31746.
//
// Rulings:
//   [2004-10-04] You can activate the ability in response to itself and get more than one creature
//     card onto the battlefield before this returns to its owner's hand.
//
// "If you do" is a creature put onto the battlefield by this resolution
// (`this-way` "put-onto-battlefield"); nothing put, this stays.

const TEXT =
  "{X}{U}: You may put a creature card with mana value X from your hand onto the battlefield. If you do, return this creature to its owner's hand.";

export default defineCard({
  name: "Metathran Aerostat",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Metathran"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "creature", manaValue: { op: "eq", n: { amount: "x" } } },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield", atLeast: 1 },
            then: { kind: "return-to-hand", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
