import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// Invasion (INV). Wood Sage's shape: `min` = `max` = 7 is clamped to the
// cards with the chosen name among the seven, so every one of them is taken;
// the rest are exiled (`leftover: "exile"`).

const TEXT =
  "Choose a card name other than a basic land card name. Reveal the top seven cards of your library and put all of them with that name into your hand. Exile the rest.";

export default defineCard({
  name: "Desperate Research",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "choose-card-name",
    filter: { notBasicLand: true },
    aim: "own-library",
    then: {
      kind: "look-and-choose",
      zone: "library",
      count: 7,
      reveal: true,
      min: 7,
      max: 7,
      filter: { hasName: CHOSEN_CARD_NAME },
      destination: "hand",
      leftover: "exile",
    },
  },
});
