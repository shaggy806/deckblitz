import { defineCard } from "../define.js";

// The look is yours alone (rule 400.2: the hand stays hidden to the other
// players), at one card picked at random. The draw is a delayed trigger at
// the next turn's upkeep, whoever's turn that is.

const TEXT =
  "{T}, Sacrifice this artifact: Look at a card at random in target player's hand. You draw a card at the beginning of the next turn's upkeep.";

export default defineCard({
  name: "Urza's Bauble",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "choose-random-card", zone: "hand", whose: 0, show: "look" },
          {
            kind: "delayed-trigger",
            at: { step: "upkeep" },
            effect: { kind: "draw", amount: 1 },
            text: "Draw a card.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
