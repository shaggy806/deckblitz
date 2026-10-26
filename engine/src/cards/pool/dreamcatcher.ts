import { defineCard } from "../define.js";

// Saviors of Kamigawa. Throwing Knife's "you may sacrifice this. If you do, …".
const TEXT = "Whenever you cast a Spirit or Arcane spell, you may sacrifice this creature. If you do, draw a card.";

export default defineCard({
  name: "Dreamcatcher",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtypes: ["Spirit", "Arcane"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Dreamcatcher to draw a card?",
        effect: { kind: "sacrifice-source", then: { kind: "draw", amount: 1 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
