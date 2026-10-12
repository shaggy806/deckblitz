import { defineCard } from "../define.js";

export default defineCard({
  name: "Stockman, Mad Fly-entist",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect", "Mutant", "Scientist"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  cycling: { cost: "{2}", search: { subtype: "Island" } },
  text: "Flying\nWhen Stockman enters, draw a card, then discard a card.\nIslandcycling {2} ({2}, Discard this card: Search your library for an Island card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "When Stockman enters, draw a card, then discard a card.",
    },
  ],
});
