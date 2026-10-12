import { defineCard } from "../define.js";

export default defineCard({
  name: "Falkenrath Celebrants",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature enters, create two Blood tokens. (They're artifacts with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two Blood tokens.",
    },
  ],
});
