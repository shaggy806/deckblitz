import { defineCard } from "../define.js";

// EDHREC rank 7558.

export default defineCard({
  name: "Northern Air Temple",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Shrine"],
  text: "When Northern Air Temple enters, each opponent loses X life and you gain X life, where X is the number of Shrines you control.\nWhenever another Shrine you control enters, each opponent loses 1 life and you gain 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // X is counted as it resolves, this Shrine included.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: { countOf: { subtype: "Shrine", controlledBy: "you" } }, who: "each-opponent" },
          { kind: "gain-life", amount: { countOf: { subtype: "Shrine", controlledBy: "you" } } },
        ],
      },
      resolve: null,
      text: "When Northern Air Temple enters, each opponent loses X life and you gain X life, where X is the number of Shrines you control.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Shrine" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever another Shrine you control enters, each opponent loses 1 life and you gain 1 life.",
    },
  ],
});
