import { defineCard } from "../define.js";

export default defineCard({
  name: "Sanity Gnawers",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, target player discards a card at random.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1, random: true },
      resolve: null,
      text: "When this creature enters, target player discards a card at random.",
    },
  ],
});
