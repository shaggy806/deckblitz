import { defineCard } from "../define.js";

// EDHREC rank 31388.

export default defineCard({
  name: "Drekavac",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, sacrifice it unless you discard a noncreature card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a noncreature card?",
        effect: { kind: "discard", target: "you", amount: 1, filter: { notTypes: ["creature"] } },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "When this creature enters, sacrifice it unless you discard a noncreature card.",
    },
  ],
});
