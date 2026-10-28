import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 22461. Mulch's shape: `min` = `max` = 4 is clamped to the
// cards with the chosen name among the four, so every one of them is taken;
// the rest go to the graveyard.

const TEXT =
  "{T}: Choose a creature card name. Reveal the top four cards of your library and put all of them with that name into your hand. Put the rest into your graveyard.";

export default defineCard({
  name: "Wood Sage",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "choose-card-name",
        filter: { types: ["creature"] },
        aim: "own-library",
        then: {
          kind: "look-and-choose",
          zone: "library",
          count: 4,
          reveal: true,
          min: 4,
          max: 4,
          filter: { hasName: CHOSEN_CARD_NAME },
          destination: "hand",
          leftover: "graveyard",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
