import { defineCard } from "../define.js";

// EDHREC rank 14568. "The roll" is the trigger's own result (Mr. House's
// shape).

const ROLL_TEXT =
  "Whenever you roll a 3 or higher, Monoxa gains first strike until end of turn. If the roll was 4 or higher, it gains menace until end of turn. If the roll was 5 or higher, it gains lifelink until end of turn.";

export default defineCard({
  name: "Monoxa, Midway Manager",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Employee"],
  power: 3,
  toughness: 3,
  text: `${ROLL_TEXT}\n{6}: Roll a six-sided die.`,
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: { kind: "roll-dice", sides: 6 },
      resolve: null,
      text: "{6}: Roll a six-sided die.",
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "rolls-die", who: "you", die: { atLeast: 3 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "trigger-value", compare: { op: "gte", n: 4 } },
            then: { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
          },
          {
            kind: "conditional",
            condition: { kind: "trigger-value", compare: { op: "gte", n: 5 } },
            then: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
});
