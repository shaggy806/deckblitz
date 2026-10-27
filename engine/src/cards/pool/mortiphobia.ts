import { defineCard } from "../define.js";

export default defineCard({
  name: "Mortiphobia",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "{1}{B}, Discard a card: Exile target card from a graveyard.\n{1}{B}, Sacrifice this enchantment: Exile target card from a graveyard.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, discard: { count: 1 } },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{1}{B}, Discard a card: Exile target card from a graveyard.",
    },
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{1}{B}, Sacrifice this enchantment: Exile target card from a graveyard.",
    },
  ],
});
