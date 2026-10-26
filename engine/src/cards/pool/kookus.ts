import { defineCard } from "../define.js";

// EDHREC rank 30350.
//
// An intervening-if (rule 603.4), checked as it triggers and again as it
// resolves (Rufus Shinra's "if you don't control a creature named …").

const UPKEEP_TEXT =
  "At the beginning of your upkeep, if you don't control a creature named Keeper of Kookus, this creature deals 3 damage to you and attacks this turn if able.";

export default defineCard({
  name: "Kookus",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 3,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${UPKEEP_TEXT}\n{R}: This creature gets +1/+0 until end of turn.`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { type: "creature", name: "Keeper of Kookus" }, atLeast: 1 },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, who: "you" },
          { kind: "restrict", target: "source", restrictions: ["must-attack"] },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
