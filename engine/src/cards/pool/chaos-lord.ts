import { defineCard } from "../define.js";

// EDHREC rank 27076.
//
// "If the number of permanents is even" closes the sentence, so it isn't an
// intervening "if" (rule 603.4): the ability always triggers and targets, and
// the permanents are counted as it resolves.

const UPKEEP = "At the beginning of your upkeep, target opponent gains control of this creature if the number of permanents is even.";
const HASTE = "This creature can attack as though it had haste unless it entered this turn.";

export default defineCard({
  name: "Chaos Lord",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 7,
  toughness: 7,
  keywords: ["first-strike"],
  text: `First strike\n${UPKEEP}\n${HASTE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "conditional",
        condition: { kind: "amount-parity", amount: { countOf: {} }, parity: "even" },
        then: { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enteredThisTurn: false } },
      attackAsThoughHaste: true,
      text: HASTE,
    },
  ],
});
