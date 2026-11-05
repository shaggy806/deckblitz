import { defineCard } from "../define.js";
import { CHOSEN_CARD_NAME } from "../../effects.js";

// EDHREC rank 26355.
//
// Name and number are chosen as it resolves, then the target reveals their whole library (Guided
// Passage's reveal, done by them, nothing taken), and the cards revealed this way are what's counted.

export default defineCard({
  name: "Mindblaze",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose a nonland card name and a number greater than 0. Target player reveals their library. If that library contains exactly the chosen number of cards with the chosen name, Mindblaze deals 8 damage to that player. Then that player shuffles.",
  targets: ["player"],
  effect: {
    kind: "choose-card-name",
    filter: { notTypes: ["land"] },
    then: {
      kind: "choose-value",
      value: "number",
      min: 1,
      then: {
        kind: "sequence",
        effects: [
          {
            kind: "as-player",
            who: { target: 0 },
            effect: {
              kind: "look-and-choose",
              zone: "library",
              count: { librarySize: "you" },
              reveal: true,
              min: 0,
              max: 0,
              destination: "hand",
              leftover: "stay",
            },
          },
          {
            kind: "conditional",
            condition: {
              kind: "amounts",
              left: { thisWay: "revealed", filter: { hasName: CHOSEN_CARD_NAME } },
              op: "eq",
              right: "x",
            },
            then: { kind: "damage", amount: 8, target: 0 },
          },
          { kind: "shuffle-library", target: 0 },
        ],
      },
    },
  },
});
