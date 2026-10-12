import { defineCard } from "../define.js";

export default defineCard({
  name: "Ripclaw Wrangler",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  text: "When this Vehicle enters, each opponent discards a card.\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)",
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
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
      resolve: null,
      text: "When this Vehicle enters, each opponent discards a card.",
    },
  ],
});
