import { defineCard } from "../define.js";

export default defineCard({
  name: "Toxic Abomination",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, you lose 2 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 2 },
      resolve: null,
      text: "When this creature enters, you lose 2 life.",
    },
  ],
});
