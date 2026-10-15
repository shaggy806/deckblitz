import { defineCard } from "../define.js";

// EDHREC rank 27979.
//
// "Enters or dies" is two triggered abilities.

export default defineCard({
  name: "Apex Witchstalker",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 6,
  toughness: 4,
  keywords: ["menace"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature enters or dies, you gain 2 life.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "When this creature enters or dies, you gain 2 life.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "When this creature enters or dies, you gain 2 life.",
    },
  ],
});
