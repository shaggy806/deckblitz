import { defineCard } from "../define.js";

export default defineCard({
  name: "Balamb T-Rexaur",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  cycling: { cost: "{2}", search: { subtype: "Forest" } },
  text: "Trample\nWhen this creature enters, you gain 3 life.\nForestcycling {2} ({2}, Discard this card: Search your library for a Forest card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, you gain 3 life.",
    },
  ],
});
