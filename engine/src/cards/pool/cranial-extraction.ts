import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 26413. "All cards with that name": the graveyard's must be
// found, the hand's and library's may be left (rule 701.23b — `all`).

export default defineCard({
  name: "Cranial Extraction",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Choose a nonland card name. Search target player's graveyard, hand, and library for all cards with that name and exile them. Then that player shuffles.",
  targets: ["player"],
  effect: {
    kind: "choose-card-name",
    filter: { notTypes: ["land"] },
    then: {
      kind: "search-library",
      whose: { target: 0 },
      zones: "graveyard-hand-library",
      filter: { hasName: CHOSEN_CARD_NAME },
      destination: "exile",
      all: true,
      min: 0,
      max: 99,
    },
  },
});
