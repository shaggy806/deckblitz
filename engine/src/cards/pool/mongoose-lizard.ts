import { defineCard } from "../define.js";

export default defineCard({
  name: "Mongoose Lizard",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mongoose", "Lizard"],
  power: 5,
  toughness: 6,
  keywords: ["menace"],
  cycling: { cost: "{2}", search: { subtype: "Mountain" } },
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature enters, it deals 1 damage to any target.\nMountaincycling {2} ({2}, Discard this card: Search your library for a Mountain card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 1 damage to any target.",
    },
  ],
});
