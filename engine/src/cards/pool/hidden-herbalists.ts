import { defineCard } from "../define.js";

// EDHREC rank 25697.

export default defineCard({
  name: "Hidden Herbalists",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, add {G}{G}.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 2 },
      resolve: null,
      text: "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, add {G}{G}.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
