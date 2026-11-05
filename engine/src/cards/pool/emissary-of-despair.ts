import { defineCard } from "../define.js";

// EDHREC rank 21248.

export default defineCard({
  name: "Emissary of Despair",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature deals combat damage to a player, that player loses 1 life for each artifact they control.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "lose-life",
        who: "trigger-player",
        amount: { countOf: { type: "artifact", controlledBy: "you" }, forPlayer: "trigger-player" },
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, that player loses 1 life for each artifact they control.",
    },
  ],
});
