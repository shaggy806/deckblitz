import { defineCard } from "../define.js";

// EDHREC rank 18760.

const TEXT = "When this creature dies, incubate 3.";

export default defineCard({
  name: "Infected Defector",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Knight"],
  power: 4,
  toughness: 3,
  text: `${TEXT} (Create an Incubator token with three +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
