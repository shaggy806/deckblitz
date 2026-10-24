import { defineCard } from "../define.js";

// Conspiracy: Take the Crown. EDHREC rank 12393.
//
// The upkeep trigger is an intervening-if (rule 603.4): it checks the monarch
// as the upkeep begins and again as it resolves. "Creatures you control can't
// be blocked this turn" is a `restrict` over a filter, a rule for the rest of
// the turn, so creatures that come under your control later are bound too
// (the ruling, rule 611.2c).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if you're the monarch, creatures you control can't be blocked this turn.";

export default defineCard({
  name: "Keeper of Keys",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Mutant"],
  power: 4,
  toughness: 4,
  text: `When this creature enters, you become the monarch.\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: "When this creature enters, you become the monarch.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "monarch", who: "you" },
      targets: [],
      effect: {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "you" },
        restrictions: ["cant-be-blocked"],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
