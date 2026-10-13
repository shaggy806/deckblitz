import { defineCard } from "../define.js";

export default defineCard({
  name: "Consulate Dreadnought",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 7,
  toughness: 11,
  text: "Crew 6 (Tap any number of creatures you control with total power 6 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 6, filter: { type: "creature" } },
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
      text: "Crew 6",
    },
  ],
});
