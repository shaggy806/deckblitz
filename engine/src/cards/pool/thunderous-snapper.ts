import { defineCard } from "../define.js";

// EDHREC rank 11904. A spell with {X} counts its chosen X (the ruling): the
// `manaValue` clause reads the spell on the stack.

const TEXT = "Whenever you cast a spell with mana value 5 or greater, draw a card.";

export default defineCard({
  name: "Thunderous Snapper",
  manaCost: "{G/U}{G/U}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Turtle", "Hydra"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 5 } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
