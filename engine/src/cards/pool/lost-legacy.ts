import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 24259. "Then draws a card for each card exiled from their hand
// this way": after the shuffle, by the searched player ("that-player").

export default defineCard({
  name: "Lost Legacy",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose a nonartifact, nonland card name. Search target player's graveyard, hand, and library for any number of cards with that name and exile them. That player shuffles, then draws a card for each card exiled from their hand this way.",
  targets: ["player"],
  effect: {
    kind: "choose-card-name",
    filter: { notTypes: ["artifact", "land"] },
    then: {
      kind: "search-library",
      whose: { target: 0 },
      zones: "graveyard-hand-library",
      filter: { hasName: CHOSEN_CARD_NAME },
      destination: "exile",
      min: 0,
      max: 99,
      then: { kind: "draw", who: "that-player", amount: { thisWay: "exiled-from-hand" } },
    },
  },
});
