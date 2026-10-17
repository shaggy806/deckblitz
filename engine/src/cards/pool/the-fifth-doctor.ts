import { defineCard } from "../define.js";

// EDHREC rank 10989.
//
// "Those creatures" are the ones that got a counter: the two steps run back
// to back over the same filter with nothing in between (Virtue of Loyalty's
// shape), and putting a counter on a creature changes neither whether it
// attacked this turn nor whether it entered this turn.
const TEXT =
  "Peaceful Coexistence — At the beginning of your end step, put a +1/+1 counter on each creature you control that didn't attack or enter this turn. Untap those creatures.";

const STAYED_HOME = {
  type: "creature",
  controlledBy: "you",
  attackedThisTurn: false,
  enteredThisTurn: false,
} as const;

export default defineCard({
  name: "The Fifth Doctor",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter-all", filter: STAYED_HOME, counter: "+1/+1", amount: 1 },
          { kind: "untap-all", filter: STAYED_HOME },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
