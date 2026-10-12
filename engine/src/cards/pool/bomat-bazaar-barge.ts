import { defineCard } from "../define.js";

export default defineCard({
  name: "Bomat Bazaar Barge",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  text: "When this Vehicle enters, draw a card.\nCrew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)",
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
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Vehicle enters, draw a card.",
    },
  ],
});
