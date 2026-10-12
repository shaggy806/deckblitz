import { defineCard } from "../define.js";

export default defineCard({
  name: "Dragonfly Suit",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Crew 1",
    },
  ],
});
