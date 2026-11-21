import { defineCard } from "../define.js";

// EDHREC rank 18278. The draw is `game-is-a-draw` (rule 104.4c): the whole
// game, every player at once, since the limited range of influence option
// isn't played. "When **you** remove the last" is `counters-removed`'s `last`
// with `byYou`: another player's removal (their Clockspinning) doesn't
// trigger it, and it never can again (the rulings).

const ENTERS_TEXT = "This enchantment enters with two intervention counters on it.";
const UPKEEP_TEXT = "At the beginning of your upkeep, remove an intervention counter from this enchantment.";
const DRAW_TEXT = "When you remove the last intervention counter from this enchantment, the game is a draw.";

export default defineCard({
  name: "Divine Intervention",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${UPKEEP_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "intervention", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "counters-removed", who: "self", counter: "intervention", last: true, byYou: true },
      targets: [],
      effect: { kind: "game-is-a-draw" },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "intervention", amount: 2 } },
      text: ENTERS_TEXT,
    },
  ],
});
