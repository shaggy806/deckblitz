import { defineCard } from "../define.js";

// EDHREC rank 15605.

export default defineCard({
  name: "The Last Ride",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 13,
  toughness: 13,
  text: "The Last Ride gets -X/-X, where X is your life total.\n{2}{B}, Pay 2 life: Draw a card.\nCrew 2",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, payLife: 2 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}{B}, Pay 2 life: Draw a card.",
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 2",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { lifeTotal: true, pt: [-1, -1] },
      text: "The Last Ride gets -X/-X, where X is your life total.",
    },
  ],
});
