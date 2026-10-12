import { defineCard } from "../define.js";

export default defineCard({
  name: "Hollowhenge Scavenger",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 5,
  text: "Morbid — When this creature enters, if a creature died this turn, you gain 5 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 5 },
      resolve: null,
      text: "Morbid — When this creature enters, if a creature died this turn, you gain 5 life.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
