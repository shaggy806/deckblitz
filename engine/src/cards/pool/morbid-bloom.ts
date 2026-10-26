import { defineCard } from "../define.js";

// X is the exiled card's toughness as it last existed in the graveyard (the
// ruling); with the target gone the spell doesn't resolve and makes nothing.
export default defineCard({
  name: "Morbid Bloom",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Exile target creature card from a graveyard, then create X 1/1 green Saproling creature tokens, where X is the exiled card's toughness.",
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Saproling Token", count: { toughnessOf: 0 } },
    ],
  },
});
