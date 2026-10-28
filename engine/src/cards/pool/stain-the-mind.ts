import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 28749.

export default defineCard({
  name: "Stain the Mind",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nChoose a nonland card name. Search target player's graveyard, hand, and library for any number of cards with that name and exile them. Then that player shuffles.",
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
      min: 0,
      max: 99,
    },
  },
});
