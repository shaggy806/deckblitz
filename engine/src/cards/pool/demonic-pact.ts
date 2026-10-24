import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 9433.
//
// Silent Hallcreeper's "choose one that hasn't been chosen": announced as the
// trigger goes on the stack (rule 603.3c), so a mode counts as chosen even if
// the ability is then countered, and a mode needing a target it can't have
// isn't offered. Remembered by this Pact alone, whoever controls it (the
// rulings); with every mode used the ability is removed. "You lose the game"
// is forced once it's the only mode left — at least one mode must be chosen.
const TRIGGER_TEXT = "At the beginning of your upkeep, choose one that hasn't been chosen —";
const DAMAGE_MODE = "This enchantment deals 4 damage to any target and you gain 4 life.";
const DISCARD_MODE = "Target opponent discards two cards.";
const DRAW_MODE = "Draw two cards.";
const LOSE_MODE = "You lose the game.";

export default defineCard({
  name: "Demonic Pact",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n• ${DAMAGE_MODE}\n• ${DISCARD_MODE}\n• ${DRAW_MODE}\n• ${LOSE_MODE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: DAMAGE_MODE,
            targets: ["any-target"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "damage", amount: 4, target: 0 },
                { kind: "gain-life", amount: 4 },
              ],
            },
          },
          { text: DISCARD_MODE, targets: ["opponent"], effect: { kind: "discard", target: 0, amount: 2 } },
          { text: DRAW_MODE, effect: { kind: "draw", amount: 2 } },
          { text: LOSE_MODE, effect: { kind: "lose-game" } },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${DAMAGE_MODE} ${DISCARD_MODE} ${DRAW_MODE} ${LOSE_MODE}`,
    },
  ],
});
