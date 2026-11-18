import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 28059.
//
// Rulings:
//   The shuffling and drawing of a card next upkeep happens even if the card is not a land.
//
// Cerebral Eruption's reveal of a target opponent's top card (`reveal-top`'s `of`, rule
// 701.20a), read through the `{ thisWay: "revealed" }` set; then that player shuffles, and
// Foresight's delayed draw.
const REVEAL_TEXT = "Reveal the top card of target opponent's library. If it's a land, you gain 1 life. Then that player shuffles.";
const DRAW_TEXT = "Draw a card at the beginning of the next turn's upkeep.";

export default defineCard({
  name: "Prophecy",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `${REVEAL_TEXT}\n${DRAW_TEXT}`,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-top", of: { target: 0 }, then: { kind: "sequence", effects: [] } },
      {
        kind: "conditional",
        condition: { kind: "amounts", left: { thisWay: "revealed", filter: { type: "land" } }, op: "gte", right: 1 },
        then: { kind: "gain-life", amount: 1 },
      },
      { kind: "shuffle-library", target: 0 },
      { kind: "delayed-trigger", at: { step: "upkeep" }, text: DRAW_TEXT, effect: { kind: "draw", amount: 1 } },
    ],
  },
});
