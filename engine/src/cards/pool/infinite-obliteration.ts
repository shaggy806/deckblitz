import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 27281.

export default defineCard({
  name: "Infinite Obliteration",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose a creature card name. Search target opponent's graveyard, hand, and library for any number of cards with that name and exile them. Then that player shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "choose-card-name",
    filter: { types: ["creature"] },
    then: {
      kind: "search-library",
      whose: { target: 0 },
      zones: "graveyard-hand-library",
      filter: { hasName: CHOSEN_CARD_NAME },
      destination: "exile",
      min: 0,
      max: 99,
    },
  },
});
