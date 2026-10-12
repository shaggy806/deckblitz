import { defineCard } from "../define.js";

export default defineCard({
  name: "Maggot Carrier",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, each player loses 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-player" },
      resolve: null,
      text: "When this creature enters, each player loses 1 life.",
    },
  ],
});
