import { defineCard } from "../define.js";

// A Mountain card is a land card with the subtype (its ruling), so
// `subtype: "Mountain"` beside "a red card" in one `anyOf`.

const COPY_TEXT =
  "Whenever you activate a loyalty ability of a Chandra planeswalker, you may pay {1}. If you do, copy that ability. You may choose new targets for the copy.";
const DRAW_TEXT = "{1}, {T}, Discard a Mountain card or a red card: Draw a card.";

export default defineCard({
  name: "Chandra's Regulator",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${COPY_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "activates-ability",
        who: "you",
        loyalty: true,
        source: { type: "planeswalker", subtype: "Chandra" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to copy that ability?",
        cost: "{1}",
        effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{1}",
        tap: true,
        discard: { count: 1, filter: { anyOf: [{ subtype: "Mountain" }, { colors: ["R"] }] } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
