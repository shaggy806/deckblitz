import { defineCard } from "../define.js";

export default defineCard({
  name: "Skybox Ferry",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  cycling: { cost: "{2}" },
  text: "Flying\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)\nCycling {2} ({2}, Discard this card: Draw a card.)",
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
