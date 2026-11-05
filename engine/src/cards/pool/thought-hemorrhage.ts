import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 31579. The damage is one instance, 3 for each card revealed with
// the name (the ruling).
export default defineCard({
  name: "Thought Hemorrhage",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Choose a nonland card name. Target player reveals their hand. Thought Hemorrhage deals 3 damage to that player for each card with the chosen name revealed this way. Search that player's graveyard, hand, and library for all cards with that name and exile them. Then that player shuffles.",
  targets: ["player"],
  effect: {
    kind: "choose-card-name",
    filter: { notTypes: ["land"] },
    then: {
      kind: "sequence",
      effects: [
        { kind: "reveal-hand", who: 0 },
        {
          kind: "damage",
          target: 0,
          amount: { product: [3, { thisWay: "revealed", filter: { hasName: CHOSEN_CARD_NAME } }] },
        },
        {
          kind: "search-library",
          whose: { target: 0 },
          zones: "graveyard-hand-library",
          filter: { hasName: CHOSEN_CARD_NAME },
          destination: "exile",
          all: true,
          min: 0,
          max: 99,
        },
      ],
    },
  },
});
