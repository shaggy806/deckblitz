import { defineCard } from "../define.js";

export default defineCard({
  name: "Wretched Anurid",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Frog", "Beast"],
  power: 3,
  toughness: 3,
  text: "Whenever another creature enters, you lose 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "lose-life", amount: 1 },
      resolve: null,
      text: "Whenever another creature enters, you lose 1 life.",
    },
  ],
});
