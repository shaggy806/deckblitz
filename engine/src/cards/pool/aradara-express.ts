import { defineCard } from "../define.js";

export default defineCard({
  name: "Aradara Express",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 8,
  toughness: 6,
  keywords: ["menace"],
  text: "Menace\nCrew 4 (Tap any number of creatures you control with total power 4 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 4, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Crew 4",
    },
  ],
});
