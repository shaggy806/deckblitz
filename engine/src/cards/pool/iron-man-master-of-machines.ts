import { defineCard } from "../define.js";

// EDHREC rank 11570. Marvel Super Heroes.
//
// The intervening-if (rule 603.4) is checked as Iron Man attacks and again as
// the ability resolves; Iron Man is an artifact, so his own entry this turn
// counts (the card doesn't say "another").

const ANTHEM_TEXT = "Iron Man gets +1/+0 for each other artifact you control.";
const ATTACK_TEXT =
  "Whenever Iron Man attacks, if an artifact entered the battlefield under your control this turn, draw a card.";

export default defineCard({
  name: "Iron Man, Master of Machines",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 1,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ANTHEM_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0], excludeSelf: true },
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
