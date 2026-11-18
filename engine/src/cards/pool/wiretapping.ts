import { defineCard } from "../define.js";
import { hideaway, playHideawayCard } from "../helpers.js";

// EDHREC rank 15954.
//
// Hideaway (rule 702.75): the exiled card is linked to this enchantment
// (607.2a). "Your first card during each of your draw steps" is the turn-based
// draw (rule 504.1), or the first card drawn there if that one was replaced —
// never a card drawn in your upkeep or an opponent's draw step. "Then if you
// have nine or more cards in hand" is checked as the ability resolves, after
// its own draw.
const DRAW_TEXT =
  "Whenever you draw your first card during each of your draw steps, draw a card. Then if you have nine or " +
  "more cards in hand, you may play the exiled card without paying its mana cost.";

export default defineCard({
  name: "Wiretapping",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text:
    "Hideaway 5 (When this enchantment enters, look at the top five cards of your library, exile one face down, then put the rest on the bottom in a random order.)\n" +
    DRAW_TEXT,
  triggered: [
    hideaway(5, "enchantment"),
    {
      trigger: { on: "draws", who: "you", firstInDrawStep: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "conditional", condition: { kind: "hand-size", atLeast: 9 }, then: playHideawayCard() },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
