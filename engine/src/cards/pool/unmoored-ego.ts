import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 26934.

export default defineCard({
  name: "Unmoored Ego",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Choose a card name. Search target opponent's graveyard, hand, and library for up to four cards with that name and exile them. That player shuffles, then draws a card for each card exiled from their hand this way.",
  targets: ["opponent"],
  effect: {
    kind: "choose-card-name",
    then: {
      kind: "search-library",
      whose: { target: 0 },
      zones: "graveyard-hand-library",
      filter: { hasName: CHOSEN_CARD_NAME },
      destination: "exile",
      min: 0,
      max: 4,
      then: { kind: "draw", who: "that-player", amount: { thisWay: "exiled-from-hand" } },
    },
  },
});
