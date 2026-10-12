import { defineCard } from "../define.js";

export default defineCard({
  name: "Untethered Express",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nWhenever this Vehicle attacks, put a +1/+1 counter on it.\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)",
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
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this Vehicle attacks, put a +1/+1 counter on it.",
    },
  ],
});
