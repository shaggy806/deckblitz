import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 26947.

export default defineCard({
  name: "Slaughter Games",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nChoose a nonland card name. Search target opponent's graveyard, hand, and library for any number of cards with that name and exile them. Then that player shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "choose-card-name",
    filter: { notTypes: ["land"] },
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
