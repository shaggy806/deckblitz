import { defineCard } from "../define.js";

export default defineCard({
  name: "Thundersteel Colossus",
  manaCost: "{7}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 7,
  toughness: 7,
  keywords: ["trample", "haste"],
  text: "Trample, haste\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)",
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
      text: "Crew 2",
    },
  ],
});
