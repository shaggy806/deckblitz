import { defineCard } from "../define.js";

// A redirected hit on you is twice that much life as one life-gaining event (the
// ruling), so "that player is you" is told apart: under an `of-player`, "you" is
// that player, and the source is under their control only then.
// "Each player this creature attacked" is read through the source as it last
// existed, if it has left by then (rule 608.2h); attacking a planeswalker isn't
// attacking its controller.

const LIFE = "Whenever a creature you control deals combat damage to a player, you and that player each gain that much life.";
const LOSE =
  "At the beginning of your end step, if you have at least 15 life more than your starting life total, each player this creature attacked this turn loses the game.";

export default defineCard({
  name: "Angel of Destiny",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Cleric"],
  power: 2,
  toughness: 6,
  keywords: ["flying", "double-strike"],
  text: `Flying, double strike\n${LIFE}\n${LOSE}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "of-player",
          player: "that-player",
          condition: { kind: "source", filter: { controlledBy: "you" } },
        },
        then: { kind: "gain-life", amount: { product: [{ triggerValue: true }, 2] } },
        else: {
          kind: "sequence",
          effects: [
            { kind: "gain-life", amount: { triggerValue: true } },
            { kind: "gain-life", amount: { triggerValue: true }, who: "trigger-player" },
          ],
        },
      },
      resolve: null,
      text: LIFE,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "life-total", atLeast: { startingPlus: 15 } },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: { kind: "source", filter: { attackedYouThisTurn: true } },
        },
        simultaneous: true,
        effect: { kind: "lose-game", who: "that-player" },
      },
      resolve: null,
      text: LOSE,
    },
  ],
});
