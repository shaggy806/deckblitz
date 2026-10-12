import { defineCard } from "../define.js";

export default defineCard({
  name: "Blood Servitor",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Blood token.",
    },
  ],
});
