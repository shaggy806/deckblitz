import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 15937.
//
// Battalion is part of the trigger condition, not an intervening if (General
// Thunderbolt Ross's `whileCondition`): three or more attacking creatures as
// it attacks — it and at least two others, declared together.
// "For each opponent, … target creature that player controls": one optional
// slot per opponent, each bound to that player by seat (Dismantling Wave's
// shape — a game seats at most four, so three opponents). "Those creatures"
// are the ones goaded this way.
const BATTALION_TEXT =
  "Battalion — Whenever this creature and at least two other creatures attack, for each opponent, goad up to one target creature that player controls. Those creatures can't block this turn.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

export default defineCard({
  name: "Sontaran General",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Alien", "Soldier"],
  power: 5,
  toughness: 5,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${BATTALION_TEXT} (Until your next turn, they attack each combat if able and attack a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "goad", target: 0 },
          { kind: "goad", target: 1 },
          { kind: "goad", target: 2 },
          { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          { kind: "restrict", target: 1, restrictions: ["cant-block"] },
          { kind: "restrict", target: 2, restrictions: ["cant-block"] },
        ],
      },
      resolve: null,
      text: BATTALION_TEXT,
    },
  ],
});
