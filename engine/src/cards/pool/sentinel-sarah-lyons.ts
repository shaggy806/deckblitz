import { defineCard } from "../define.js";

// EDHREC rank 7831. Fallout.
//
// The anthem asks what entered under your control this turn, as it entered
// (`turn-history`'s `entered`): one artifact is enough, it needn't still be
// there, and she needn't have been there when it entered (the rulings).
// Battalion is part of the trigger condition (General Thunderbolt Ross); the
// damage counts the artifacts you control as it resolves, from her as she
// last existed if she has left (the rulings).
const ANTHEM_TEXT =
  "As long as an artifact entered the battlefield under your control this turn, creatures you control get +2/+2.";
const BATTALION_TEXT =
  "Battalion — Whenever Sentinel Sarah Lyons and at least two other creatures attack, Sentinel Sarah Lyons deals damage equal to the number of artifacts you control to target player.";

export default defineCard({
  name: "Sentinel Sarah Lyons",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${ANTHEM_TEXT}\n${BATTALION_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "artifact" } },
      grantPt: [2, 2],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: ["player"],
      effect: {
        kind: "damage",
        amount: { countOf: { type: "artifact", controlledBy: "you" } },
        target: 0,
      },
      resolve: null,
      text: BATTALION_TEXT,
    },
  ],
});
