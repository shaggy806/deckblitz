import { defineCard } from "../define.js";

// EDHREC rank 24725.

const HASTE_TEXT = "Each other creature you control with a +1/+1 counter on it has haste.";
const COUNTER_TEXT = "{1}{R}, {T}: Put a +1/+1 counter on target creature that entered this turn.";

export default defineCard({
  name: "Gallia, the Merrymaker",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Satyr"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${HASTE_TEXT}\n${COUNTER_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        excludeSelf: true,
      },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", enteredThisTurn: true } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
