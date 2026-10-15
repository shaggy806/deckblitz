import { defineCard } from "../define.js";

// EDHREC rank 14903.
//
// Rulings:
//   [2025-11-17] You pay all costs and follow all timing rules for cards played this way. For
//     example, if the chosen exiled card is a land card, you may play it only during your main
//     phase while the stack is empty.

// "When that creature dies this turn" is Scarblade's Malice's delayed leave
// trigger; "its power" reads the creature as it last existed on the
// battlefield (rule 608.2h). "Choose a card exiled this way" is
// impulse-exile's `choose: 1`; the rest stay exiled with no permission.
const DIES_TEXT =
  "When that creature dies this turn, exile a number of cards from the top of your library equal to its power, then choose a card exiled this way. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "End-Blaze Epiphany",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `End-Blaze Epiphany deals X damage to target creature. ${DIES_TEXT}`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: {
          kind: "impulse-exile",
          amount: { powerOf: "trigger-object" },
          duration: "your-next-turn",
          choose: 1,
        },
        text: DIES_TEXT,
      },
    ],
  },
});
