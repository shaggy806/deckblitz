import { defineCard } from "../define.js";

// EDHREC rank 13161.
// Makes Rat → use "Rat Token (Can't Block)".
// The +2/+0 reaches only the creatures you control as it resolves; the
// second sentence is a delayed triggered ability for the rest of the turn
// (rule 603.7c), so a nontoken creature that enters later and dies makes a
// Rat too (the ruling).
const PUMP_TEXT = "Creatures you control get +2/+0 until end of turn.";
const DIES_TEXT =
  'Whenever a nontoken creature you control dies this turn, create a 1/1 black Rat creature token with "This token can\'t block."';

export default defineCard({
  name: "Gnawing Crescendo",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${PUMP_TEXT} ${DIES_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "dies", who: "you-control", filter: { type: "creature", token: false } } },
        effect: { kind: "create-token", token: "Rat Token (Can't Block)", count: 1 },
        text: DIES_TEXT,
      },
    ],
  },
});
