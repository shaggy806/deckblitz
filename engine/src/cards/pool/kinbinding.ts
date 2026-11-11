import { defineCard } from "../define.js";

// EDHREC rank 6510.
//
// - X is a journal read (`grantPtPerCount.turnHistory`): each creature that
//   entered under your control this turn as it was when it entered, so one
//   that has since died, or stopped being a creature, still counts, and a
//   creature you gained control of after it entered doesn't.
const ANTHEM_TEXT =
  "Creatures you control get +X/+X, where X is the number of creatures that entered the battlefield under your control this turn.";
const TOKEN_TEXT = "At the beginning of combat on your turn, create a 1/1 green and white Kithkin creature token.";

export default defineCard({
  name: "Kinbinding",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ANTHEM_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPtPerCount: { turnHistory: { what: "entered", filter: { type: "creature" } }, pt: [1, 1] },
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
