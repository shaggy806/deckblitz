import { defineCard } from "../define.js";

// EDHREC rank 12393.
//
// An intervening-if (rule 603.4), checked as the upkeep begins and again as
// it resolves. The `restrict` with a filter is a rule for the rest of the
// turn, so a creature that enters or comes under your control later this
// turn can't be blocked either (the ruling, rule 611.2c's exception).

const MONARCH_TEXT = "When this creature enters, you become the monarch.";
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
  text: `${MONARCH_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH_TEXT,
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
