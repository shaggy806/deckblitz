import { defineCard } from "../define.js";

// The −9's finds may be cast any time this turn their own timing allows, paying
// their costs (the search's `playable` permission); "any number" may be none,
// in the graveyard too (`upTo`).

const IMPULSE =
  "+1: Discard your hand, then exile the top three cards of your library. Until end of turn, you may play cards exiled this way.";
const BOLT = "+1: Chandra deals 2 damage to any target.";
const ULT =
  "−9: Search your graveyard and library for any number of red instant and/or sorcery cards, exile them, then shuffle. You may cast them this turn. Add six {R}.";

export default defineCard({
  name: "Chandra, Heart of Fire",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 5,
  text: `${IMPULSE}\n${BOLT}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "impulse-exile", amount: 3, duration: "end-of-turn", play: true },
        ],
      },
      resolve: null,
      text: IMPULSE,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: BOLT,
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { colors: ["R"], typesAnyOf: ["instant", "sorcery"] },
            destination: "exile",
            zones: "library-and-graveyard",
            upTo: true,
            min: 0,
            max: 999,
            mayPlay: { duration: "end-of-turn" },
          },
          { kind: "add-mana", mana: "R", amount: 6 },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
