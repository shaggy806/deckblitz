import { defineCard } from "../define.js";

// EDHREC rank 10318. Both triggers fire only in the enchanted player's own
// steps (`who: "attached"`), so "that player" is the active player.

const DRAW_TEXT = "At the beginning of enchanted player's draw step, that player draws two additional cards.";
const END_TEXT = "At the beginning of enchanted player's end step, that player discards their hand.";

export default defineCard({
  name: "Curse of Obsession",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${DRAW_TEXT}\n${END_TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "attached" },
      targets: [],
      effect: { kind: "draw", amount: 2, who: "active-player" },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "attached" },
      targets: [],
      effect: { kind: "discard-hand", who: "active-player" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
