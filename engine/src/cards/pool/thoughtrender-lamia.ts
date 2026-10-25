import { defineCard } from "../define.js";

const TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, each opponent discards a card.";

// "This creature or another enchantment you control": it is an enchantment
// itself, so one enchantment-you-control enters trigger covers both.
export default defineCard({
  name: "Thoughtrender Lamia",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Lamia"],
  power: 5,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
