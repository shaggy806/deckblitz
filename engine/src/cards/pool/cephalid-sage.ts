import { defineCard } from "../define.js";

// The enters trigger exists only while threshold holds, so it triggers only
// if there are seven or more cards in your graveyard as it enters; once
// triggered it resolves whatever the graveyard does (the rulings).

const ENTER_TEXT = "When this creature enters, draw three cards, then discard two cards.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature has "${ENTER_TEXT}"`;

export default defineCard({
  name: "Cephalid Sage",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 2,
  toughness: 3,
  text: THRESHOLD_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 3 },
              { kind: "discard", target: "you", amount: 2 },
            ],
          },
          resolve: null,
          text: ENTER_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
