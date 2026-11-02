import { defineCard } from "../define.js";

const DRAW_TEXT = "{X}{X}, {T}: Each player draws X cards.";
const MILL_TEXT = "{2}{U}, {T}: Each opponent mills cards equal to the number of cards in their hand.";

export default defineCard({
  name: "Folio of Fancies",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `Players have no maximum hand size.\n${DRAW_TEXT}\n${MILL_TEXT}`,
  static: [{ affects: { scope: "self" }, noMaxHandSize: "each-player", text: "Players have no maximum hand size." }],
  activated: [
    {
      cost: { mana: "{X}{X}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: "x", who: "each-player" },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: { kind: "mill", target: "that-player", amount: { cardsInHand: "that-player" } },
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
