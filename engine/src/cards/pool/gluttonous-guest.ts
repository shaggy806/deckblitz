import { defineCard } from "../define.js";

export default defineCard({
  name: "Gluttonous Guest",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 4,
  text: "When this creature enters, create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")\nWhenever you sacrifice a Blood token, you gain 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Blood token.",
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Blood", token: true } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever you sacrifice a Blood token, you gain 1 life.",
    },
  ],
});
