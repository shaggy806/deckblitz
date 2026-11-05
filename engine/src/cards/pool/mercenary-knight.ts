import { defineCard } from "../define.js";

// EDHREC rank 30634.

export default defineCard({
  name: "Mercenary Knight",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary", "Knight"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, sacrifice it unless you discard a creature card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a creature card?",
        effect: { kind: "discard", target: "you", amount: 1, filter: { type: "creature" } },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "When this creature enters, sacrifice it unless you discard a creature card.",
    },
  ],
});
