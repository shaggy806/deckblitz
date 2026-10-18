import { defineCard } from "../define.js";

// EDHREC rank 25891.
//
// "Its power" is read as it last existed on the battlefield (the ruling, rule
// 608.2h), pumps included — `powerOf: "source"` of a dies trigger.
//
// Rulings:
//   [2023-04-14] Use Furnace Gremlin's power from when it was last on the battlefield to
//     determine the value of X.

const PUMP_TEXT = "{1}{R}: This creature gets +1/+0 until end of turn.";
const DIES_TEXT = "When this creature dies, incubate X, where X is its power.";

export default defineCard({
  name: "Furnace Gremlin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Gremlin"],
  power: 1,
  toughness: 2,
  text: `${PUMP_TEXT}\n${DIES_TEXT} (Create an Incubator token with X +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: { powerOf: "source" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
