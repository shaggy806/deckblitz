import { defineCard } from "../define.js";


export default defineCard({
  name: "Operations Officer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nWhen this creature enters, draw a card.\nWhenever this creature attacks, put a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature enters, draw a card.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature attacks, put a +1/+1 counter on it.",
    },
  ],
});
