import { defineCard } from "../define.js";

// EDHREC rank 15429.
//
// The creature is chosen as the corrupted ability resolves, not targeted: any
// creature you control, one without toxic too (no cards), and its total toxic
// value is read then — every toxic ability it has, summed (rule 702.164b; the
// rulings). With no creature, nothing is drawn.
const ENTER =
  "When this enchantment enters, create two 3/3 green Phyrexian Beast creature tokens with toxic 1. " +
  "(Players dealt combat damage by them also get a poison counter.)";
const CORRUPTED =
  "Corrupted — At the beginning of your upkeep, if an opponent has three or more poison counters, choose a " +
  "creature you control, then draw cards equal to its total toxic value.";

export default defineCard({
  name: "Goliath Hatchery",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER}\n${CORRUPTED}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Beast Token", count: 2 },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "draw", amount: { toxicOf: 0 } },
        prompt: "Choose a creature you control — you draw cards equal to its total toxic value",
      },
      resolve: null,
      text: CORRUPTED,
    },
  ],
});
