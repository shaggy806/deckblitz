import { defineCard } from "../define.js";

// EDHREC rank 29272.
//
// A modal triggered ability: the mode is chosen as it goes on the stack
// (rules 603.3c, 700.2b), the damage mode's target with it.

const TRIGGER_TEXT = "Whenever Titanium Man attacks, choose one —";
const FLY_MODE = "• Titanium Man gains flying until end of turn.";
const PING_MODE = "• Titanium Man deals 1 damage to any target.";

export default defineCard({
  name: "Titanium Man",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 4,
  text: `${TRIGGER_TEXT}\n${FLY_MODE}\n${PING_MODE}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: FLY_MODE,
            effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          },
          {
            text: PING_MODE,
            targets: ["any-target"],
            effect: { kind: "damage", amount: 1, target: 0 },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT}\n${FLY_MODE}\n${PING_MODE}`,
    },
  ],
});
