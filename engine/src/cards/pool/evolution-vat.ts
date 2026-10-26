import type { ActivatedAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 25492.
//
// The granted ability rides on the creature (Banishing Knack's shape), so its
// controller activates it.

const GRANTED_TEXT = "{2}{G}{U}: Double the number of +1/+1 counters on this creature.";
const DOUBLE: ActivatedAbility = {
  cost: { mana: "{2}{G}{U}", tap: false },
  targets: [],
  effect: { kind: "double-counters", target: "source", counter: "+1/+1" },
  resolve: null,
  text: GRANTED_TEXT,
};
const TEXT = `{3}, {T}: Tap target creature and put a +1/+1 counter on it. Until end of turn, that creature gains "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Evolution Vat",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-activated", target: 0, ability: DOUBLE, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
