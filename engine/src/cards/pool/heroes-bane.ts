import { defineCard } from "../define.js";

const PUMP_TEXT = "{2}{G}{G}: Put X +1/+1 counters on this creature, where X is its power.";

// X is read once, as the ability resolves (the ruling); a power below 0
// puts no counters on.
export default defineCard({
  name: "Heroes' Bane",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  text: `This creature enters with four +1/+1 counters on it.\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: "This creature enters with four +1/+1 counters on it.",
    },
  ],
});
