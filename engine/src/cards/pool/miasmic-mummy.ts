import { defineCard } from "../define.js";

const TEXT = "When this creature enters, each player discards a card.";

export default defineCard({
  name: "Miasmic Mummy",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Jackal"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
