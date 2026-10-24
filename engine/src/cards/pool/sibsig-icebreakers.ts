import { defineCard } from "../define.js";

// EDHREC rank 23957.

const TEXT = "When this creature enters, each player discards a card.";

export default defineCard({
  name: "Sibsig Icebreakers",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 3,
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
