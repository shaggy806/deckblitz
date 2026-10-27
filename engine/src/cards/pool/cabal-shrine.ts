import { defineCard } from "../define.js";

// EDHREC rank 31417.

export default defineCard({
  name: "Cabal Shrine",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Whenever a player casts a spell, that player discards X cards, where X is the number of cards in all graveyards with the same name as that spell.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: { kind: "discard", target: "trigger-controller", amount: { countInGraveyard: { sameNameAsTriggerObject: true } } },
      resolve: null,
      text: "Whenever a player casts a spell, that player discards X cards, where X is the number of cards in all graveyards with the same name as that spell.",
    },
  ],
});
