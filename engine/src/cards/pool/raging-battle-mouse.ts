import { defineCard } from "../define.js";
import { CELEBRATION_CONDITION } from "../helpers.js";

// EDHREC rank 12418.
//
// Highspire Bell-Ringer's cost reduction: a spell's cost is worked out before
// it becomes cast (rules 601.2f, 601.2i), so "the second spell" is the one
// cast while exactly one other has been cast this turn — ones cast before
// this entered included, and never this card itself (the rulings).
//
// Celebration (an ability word — rule 207.2c) reads the turn's history, not
// the board: nonland permanents that entered under your control this turn
// count though they've left or changed control since (the rulings).

const COST_TEXT = "The second spell you cast each turn costs {1} less to cast.";
const CELEBRATION_TEXT =
  "Celebration — At the beginning of combat on your turn, if two or more nonland permanents entered the battlefield under your control this turn, target creature you control gets +1/+1 until end of turn.";

export default defineCard({
  name: "Raging Battle Mouse",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mouse"],
  power: 2,
  toughness: 1,
  text: `${COST_TEXT}\n${CELEBRATION_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 1, atMost: 1 },
      costModification: { applies: {}, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: CELEBRATION_TEXT,
      condition: CELEBRATION_CONDITION,
    },
  ],
});
