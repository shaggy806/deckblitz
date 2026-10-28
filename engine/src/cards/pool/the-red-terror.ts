import { defineCard } from "../define.js";

// "Deals damage to one or more permanents and/or players": no recipient
// named, so once per red source per simultaneous damage event (rule 603.2c).
const TEXT =
  "Advanced Species — Whenever a red source you control deals damage to one or more permanents and/or players, put a +1/+1 counter on The Red Terror.";

export default defineCard({
  name: "The Red Terror",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
