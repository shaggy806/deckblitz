import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 26693. The Zombies are that player's, one for each card exiled
// from their hand, made after the shuffle.

export default defineCard({
  name: "Necromentia",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose a card name other than a basic land card name. Search target opponent's graveyard, hand, and library for any number of cards with that name and exile them. That player shuffles, then creates a 2/2 black Zombie creature token for each card exiled from their hand this way.",
  targets: ["opponent"],
  effect: {
    kind: "choose-card-name",
    filter: { notBasicLand: true },
    then: {
      kind: "search-library",
      whose: { target: 0 },
      zones: "graveyard-hand-library",
      filter: { hasName: CHOSEN_CARD_NAME },
      destination: "exile",
      min: 0,
      max: 99,
      then: {
        kind: "create-token",
        token: "Zombie Token",
        who: "that-player",
        count: { thisWay: "exiled-from-hand" },
      },
    },
  },
});
