import { defineCard } from "../define.js";

export default defineCard({
  name: "Veloheart Bike",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 2,
  text: "When this Vehicle enters, you gain 2 life.\n{T}: Add one mana of any color.\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
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
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "When this Vehicle enters, you gain 2 life.",
    },
  ],
});
