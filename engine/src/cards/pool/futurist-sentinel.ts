import { defineCard } from "../define.js";

export default defineCard({
  name: "Futurist Sentinel",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  text: "Crew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 3, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Crew 3",
    },
  ],
});
