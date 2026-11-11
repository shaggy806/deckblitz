import { defineCard } from "../define.js";

// EDHREC rank 7578.
//
// Rulings:
//   If Anje and some number of other Vampires enter at the same time, you
//   create only one Blood token.
//   If an effect refers to a Blood token, it means any artifact token with the
//   subtype Blood.
//
// "Anje and/or one or more other Vampires" is one batched enters trigger over
// Anje herself or any Vampire (`isSource` keeps Anje in even if she stops
// being a Vampire), once each turn.

const ENTER_TEXT =
  "Whenever Anje and/or one or more other Vampires you control enter, create a Blood token. This ability triggers only once each turn. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")";
const DRAIN_TEXT = "{2}, Sacrifice another creature or a Blood token: Each opponent loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Anje, Maid of Dishonor",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 5,
  text: `${ENTER_TEXT}\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { anyOf: [{ isSource: true }, { subtype: "Vampire" }] },
        batched: true,
      },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        sacrifice: {
          filter: { anyOf: [{ type: "creature", isSource: false }, { subtype: "Blood", token: true }] },
        },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
