import { defineCard } from "../define.js";

export default defineCard({
  name: "Press the Enemy",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target spell or nonland permanent an opponent controls to its owner's hand. You may cast an instant or sorcery spell with equal or lesser mana value from your hand without paying its mana cost.",
  targets: [{ kind: "spell-or-permanent", whose: "opponent", filter: { notTypes: ["land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "stack" },
      { kind: "return-to-hand", target: 0 },
      {
        kind: "cast-now",
        from: "hand",
        free: true,
        spell: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: { amount: { manaValueOf: 0 } } } },
      },
    ],
  },
});
