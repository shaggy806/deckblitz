import { defineCard } from "../define.js";

export default defineCard({
  name: "Fire Nation Warship",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach\nWhen this Vehicle dies, create a Clue token. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)",
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
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "When this Vehicle dies, create a Clue token.",
    },
  ],
});
