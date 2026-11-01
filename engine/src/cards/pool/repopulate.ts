import { defineCard } from "../define.js";

// Legions (LGN). That player's creature cards only; their library is
// shuffled whether any went in or not.

export default defineCard({
  name: "Repopulate",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Shuffle all creature cards from target player's graveyard into that player's library.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["player"],
  effect: { kind: "shuffle-graveyard-into-library", target: 0, filter: { type: "creature" } },
});
