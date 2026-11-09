import { defineCard } from "../define.js";

// Ravnica: City of Guilds. See Mindlock Orb, for this turn alone.
const TEXT =
  "({U/B} can be paid with either {U} or {B}.)\nPlayers can't search libraries this turn.\nDraw a card.";

export default defineCard({
  name: "Shadow of Doubt",
  manaCost: "{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prohibit", prohibits: [{ act: "search", who: "each-player" }], duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});
