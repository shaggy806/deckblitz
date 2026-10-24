import { defineCard } from "../define.js";

// Rulings:
//   [2016-01-22] To activate a cohort ability, the Ally with that ability must have been under your
//     control continuously since the beginning of your most recent turn. However, the other Ally
//     you tap can be one that just came under your control.

const TEXT =
  "Cohort — {T}, Tap an untapped Ally you control: Look at the top four cards of your library. You may reveal an Equipment card from among them and put it into your hand. Put the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Stoneforge Acolyte",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Artificer", "Ally"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        tapOthers: { count: 1, filter: { subtype: "Ally", controlledBy: "you" } },
      },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { subtype: "Equipment" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
