import { defineCard } from "../define.js";

export default defineCard({
  name: "Debris Beetle",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nWhen this Vehicle enters, each opponent loses 3 life and you gain 3 life.\nCrew 2",
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
      crew: true,
      text: "Crew 2",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3, who: "each-opponent" },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: "When this Vehicle enters, each opponent loses 3 life and you gain 3 life.",
    },
  ],
});
