import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

const DELAYED_TEXT =
  "At the beginning of the next main phase this turn, draw a card for each player who was dealt combat damage this turn.";

export default defineCard({
  name: "Vivien's Stampede",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Each creature you control gains vigilance, trample, and melee until end of turn. (Whenever a creature with melee attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)\n${DELAYED_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "trample", duration: "end-of-turn" },
      { kind: "grant-triggered-all", filter: { type: "creature", controlledBy: "you" }, duration: "end-of-turn", ability: melee() },
      {
        kind: "delayed-trigger",
        at: { step: "main", which: "this-turn" },
        effect: { kind: "draw", amount: { playersWithTurnStat: "combat-damage-taken", who: "each-player" } },
        text: DELAYED_TEXT,
      },
    ],
  },
});
