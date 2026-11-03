import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// "Up to four cards with that name": none has to be found, the graveyard's
// included, and the finds are exiled together; that player shuffles either way.

export default defineCard({
  name: "Ancient Vendetta",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose a card name. Search target opponent's graveyard, hand, and library for up to four cards with that name and exile them. Then that player shuffles.",
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
    },
  },
});
