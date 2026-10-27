import { defineCard } from "../define.js";

// EDHREC rank 19066.

export default defineCard({
  name: "Nantuko Shrine",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever a player casts a spell, that player creates X 1/1 green Squirrel creature tokens, where X is the number of cards in all graveyards with the same name as that spell.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: { kind: "create-token", token: "Squirrel Token", count: { countInGraveyard: { sameNameAsTriggerObject: true } }, who: "trigger-controller" },
      resolve: null,
      text: "Whenever a player casts a spell, that player creates X 1/1 green Squirrel creature tokens, where X is the number of cards in all graveyards with the same name as that spell.",
    },
  ],
});
