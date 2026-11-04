import { defineCard } from "../define.js";

// EDHREC rank 1874. Modern Horizons 3 Commander.
//
// A target's filter reads the X paid (`n: "x"`), so the ability is offered once
// per X (`targetSpecReadsX`). The copy is of the card, what it last was on the
// battlefield not being what it is in the graveyard (the rulings; The Scarab
// God's shape). "A Desert" can be this land itself, tapped for the same cost:
// the ability still resolves, without its source.
const REANIMATE_TEXT =
  "{X}{2}, {T}, Sacrifice a Desert: Exile target creature card with mana value X from your graveyard. Create a token that's a copy of it, except it's a 4/4 black Zombie. Activate only as a sorcery.";

export default defineCard({
  name: "Lazotep Quarry",
  colors: [],
  types: ["land"],
  subtypes: ["Desert"],
  text: `{T}: Add {C}.\n{T}, Sacrifice a creature: Add one mana of any color.\n${REANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}, Sacrifice a creature: Add one mana of any color.",
    },
    {
      cost: { mana: "{X}{2}", tap: true, sacrifice: { filter: { subtype: "Desert" } } },
      sorcerySpeed: true,
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "create-token-copy",
            of: 0,
            count: 1,
            who: "you",
            exceptions: { basePt: [4, 4], setColors: ["B"], setSubtypes: ["Zombie"] },
          },
        ],
      },
      resolve: null,
      text: REANIMATE_TEXT,
    },
  ],
});
