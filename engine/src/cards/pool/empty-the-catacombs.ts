import { defineCard } from "../define.js";

// "All": each player's choice is bounded below and above by the creature cards in every
// graveyard, which the engine clamps to the ones in that player's own — so every one of them
// goes, with nothing to choose (Grave Consequences' shape).

const TEXT = "Each player returns all creature cards from their graveyard to their hand.";

export default defineCard({
  name: "Empty the Catacombs",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "for-each-player",
    who: "each-player",
    effect: {
      kind: "look-and-choose",
      zone: "graveyard",
      player: "that-player",
      filter: { type: "creature" },
      min: { countInGraveyard: { type: "creature" } },
      max: { countInGraveyard: { type: "creature" } },
      destination: "hand",
      leftover: "stay",
    },
  },
});
