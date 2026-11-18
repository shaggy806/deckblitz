import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 13783.
//
// Rulings:
//   If two Mystic Barriers are on the battlefield with two different chosen directions, you may not
//     attack a player or planeswalker unless that player or the controller of that planeswalker is
//     the opponent seated nearest you in both directions. (This happens most often in two-player
//     games.)
//   Mystic Barrier doesn't affect creatures that enter the battlefield attacking.
//   Mystic Barrier affects only what players and planeswalkers each player may attack with
//     creatures they control.
//
// "Choose left or right" is made as each trigger resolves (rule 608.2d): a
// two-mode `modal` whose modes note the word on the enchantment, replacing the
// one before — "the last chosen direction". The rule every player attacks
// under is Pramikon's static, which reads that word (`attackOnlyNearestOpponent`):
// left is onward in turn order, right is back, skipping players who have lost.
// Until the enters trigger has resolved nothing is chosen, and the static does
// nothing.

const CHOOSE_TEXT =
  "When this enchantment enters and at the beginning of your upkeep, choose left or right.";
const ATTACK_TEXT =
  "Each player may attack only the nearest opponent in the last chosen direction and planeswalkers " +
  "controlled by that opponent.";

const chooseDirection: EffectSpec = {
  kind: "modal",
  minModes: 1,
  maxModes: 1,
  modes: [
    { text: "Left — the next opponent in turn order", effect: { kind: "note", word: "left" } },
    { text: "Right — the previous opponent in turn order", effect: { kind: "note", word: "right" } },
  ],
};

const choose = (trigger: TriggeredAbility["trigger"]): TriggeredAbility => ({
  trigger,
  targets: [],
  effect: chooseDirection,
  resolve: null,
  text: CHOOSE_TEXT,
});

export default defineCard({
  name: "Mystic Barrier",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${CHOOSE_TEXT}\n${ATTACK_TEXT}`,
  static: [{ affects: { scope: "self" }, attackOnlyNearestOpponent: true, text: ATTACK_TEXT }],
  triggered: [
    choose({ on: "enters-battlefield", who: "self" }),
    choose({ on: "step-begins", step: "upkeep", who: "you" }),
  ],
});
