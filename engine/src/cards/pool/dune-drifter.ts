import { defineCard } from "../define.js";

// EDHREC rank 18946.
//
// Rulings:
//   [2025-02-07] If this Vehicle enters and wasn't cast, or it was cast without paying its mana
//     cost, X is 0.
//
// The enters trigger reads the X it was cast with (rule 107.3m — Kinetic
// Ooze's target bound); entered any other way, X is 0.

const TEXT =
  "When this Vehicle enters, return target artifact or creature card with mana value X or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Dune Drifter",
  manaCost: "{X}{W}{B}",
  colors: ["W", "B"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  text: `${TEXT}\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 2",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "lte", n: "x" } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
