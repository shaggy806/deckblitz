import { defineCard } from "../define.js";

// EDHREC rank 17295.

export default defineCard({
  name: "Bloodbond March",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  text: "Whenever a player casts a creature spell, each player returns all cards with the same name as that spell from their graveyard to the battlefield.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          player: "that-player",
          filter: { sameNameWith: "trigger-object" },
          min: { countInGraveyard: { sameNameWith: "trigger-object" } },
          max: { countInGraveyard: { sameNameWith: "trigger-object" } },
          destination: "battlefield",
          leftover: "stay",
        },
      },
      resolve: null,
      text: "Whenever a player casts a creature spell, each player returns all cards with the same name as that spell from their graveyard to the battlefield.",
    },
  ],
});
