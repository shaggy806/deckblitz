import { defineCard } from "../define.js";

const RETURN_TEXT =
  "For as long as any of those cards remain exiled, at the beginning of each player's upkeep, that player returns one of the exiled cards they own to the battlefield.";

// Rulings:
//   Each player chooses which one of their exiled cards to return during each of their upkeeps.
//   You can't pick a card that can't legally be returned to the battlefield. If there are no cards
//     that can be legally returned, then you can't pick one.
export default defineCard({
  name: "Dimensional Breach",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Exile all permanents. ${RETURN_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: {} },
      {
        kind: "delayed-trigger",
        about: "exiled",
        at: {
          whenever: { on: "step-begins", step: "upkeep", who: "any" },
          until: "while-exiled",
        },
        effect: {
          kind: "look-and-choose",
          zone: "targets",
          exiledThatCanEnter: true,
          player: "active-player",
          min: 1,
          max: 1,
          filter: { ownedBy: "you" },
          destination: "battlefield",
          leftover: "stay",
          under: "owners",
        },
        text: RETURN_TEXT,
      },
    ],
  },
});
