import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 28112.

export default defineCard({
  name: "Dispossess",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose an artifact card name. Search target opponent's graveyard, hand, and library for any number of cards with the chosen name and exile them. Then that player shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "choose-card-name",
    filter: { types: ["artifact"] },
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
