import { defineCard } from "../define.js";

// EDHREC rank 26499.

const COMBAT_TEXT =
  "At the beginning of combat on each player's turn, that player may draw a card. If they do, they can't attack this turn and you put a peace counter on this enchantment.";
const WIN_TEXT =
  "At the beginning of your upkeep, if this enchantment has twelve or more peace counters on it, you win the game.";

// "They can't attack this turn": no creature that player controls can
// attack, whoever it would attack — a `restrict` over that
// player's creatures.
export default defineCard({
  name: "Peace in Our Time",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${COMBAT_TEXT}\n${WIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Draw a card? If you do, you can't attack this turn.",
        effect: { kind: "draw", amount: 1 },
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "restrict", filter: { type: "creature", controlledBy: "you" }, sideOf: "that-player", restrictions: ["cant-attack"], duration: "end-of-turn" },
            { kind: "add-counter", target: "source", counter: "peace", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "peace", compare: { op: "gte", n: 12 } },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: WIN_TEXT,
    },
  ],
});
