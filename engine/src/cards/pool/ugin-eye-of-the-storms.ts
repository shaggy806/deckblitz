import { defineCard } from "../define.js";

// The −11's finds are cast later this turn, each when its own timing allows
// (the ruling), free only: no alternative cost, X = 0, additional costs paid
// (rule 118.9 and the rulings) — the search's `playable` permission.

const CAST = "When you cast this spell, exile up to one target permanent that's one or more colors.";
const COLORLESS = "Whenever you cast a colorless spell, exile up to one target permanent that's one or more colors.";
const PLUS = "+2: You gain 3 life and draw a card.";
const ZERO = "0: Add {C}{C}{C}.";
const ULT =
  "−11: Search your library for any number of colorless nonland cards, exile them, then shuffle. Until end of turn, you may cast those cards without paying their mana costs.";

const COLORED_PERMANENT = { kind: "optional", of: { kind: "permanent", filter: { colorless: false } } } as const;

export default defineCard({
  name: "Ugin, Eye of the Storms",
  manaCost: "{7}",
  colors: [],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ugin"],
  loyalty: 7,
  text: `${CAST}\n${COLORLESS}\n${PLUS}\n${ZERO}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 3 },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: -11,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { colorless: true, notTypes: ["land"] },
        destination: "exile",
        min: 0,
        max: { librarySize: "you" },
        playable: { duration: "end-of-turn", free: true },
      },
      resolve: null,
      text: ULT,
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [COLORED_PERMANENT],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: CAST,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colorless: true } },
      targets: [COLORED_PERMANENT],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: COLORLESS,
    },
  ],
});
