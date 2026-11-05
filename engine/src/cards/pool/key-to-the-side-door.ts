import { defineCard } from "../define.js";

const ROUTE_TEXT = "{2}, {T}: Target creature can't be blocked this turn.";
const DRAW_TEXT = "{1}, {T}, Discard a legendary card with the same name as a legendary permanent you control: Draw two cards.";

export default defineCard({
  name: "Key to the Side-Door",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${ROUTE_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: ROUTE_TEXT,
    },
    {
      cost: {
        mana: "{1}",
        tap: true,
        discard: {
          count: 1,
          filter: {
            supertype: "legendary",
            sameNameWith: { permanents: { supertype: "legendary", controlledBy: "you" } },
          },
        },
      },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
