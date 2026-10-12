import { defineCard } from "../define.js";

export default defineCard({
  name: "Adventurer's Airship",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever this Vehicle attacks, draw a card, then discard a card.\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)",
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
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "Whenever this Vehicle attacks, draw a card, then discard a card.",
    },
  ],
});
