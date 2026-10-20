import { defineCard } from "../define.js";

// EDHREC rank 14503.

const INCUBATE_TEXT = "When this enchantment enters, incubate 3.";
const DIES_TEXT = "Whenever a Phyrexian you control dies, surveil 1.";

export default defineCard({
  name: "Gift of Compleation",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${INCUBATE_TEXT} (Create an Incubator token with three +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)\n${DIES_TEXT} (Look at the top card of your library. You may put that card into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: 3 },
      resolve: null,
      text: INCUBATE_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Phyrexian" } },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
