import { defineCard } from "../define.js";

// EDHREC rank 21832.

export default defineCard({
  name: "Aven Shrine",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever a player casts a spell, that player gains X life, where X is the number of cards in all graveyards with the same name as that spell.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: { kind: "gain-life", amount: { countInGraveyard: { sameNameAsTriggerObject: true } }, who: "trigger-controller" },
      resolve: null,
      text: "Whenever a player casts a spell, that player gains X life, where X is the number of cards in all graveyards with the same name as that spell.",
    },
  ],
});
