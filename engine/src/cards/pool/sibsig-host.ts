import { defineCard } from "../define.js";

export default defineCard({
  name: "Sibsig Host",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 6,
  text: "When this creature enters, each player mills three cards.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 3 },
      resolve: null,
      text: "When this creature enters, each player mills three cards.",
    },
  ],
});
