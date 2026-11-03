import { defineCard } from "../define.js";

// Bloodthirst (rule 702.54a) printed is an entry replacement, as Furyborn
// Hellkite's. Gained as a spell it's the trigger's `enters-with-counters`,
// asked as that creature enters, and each instance applies apart (702.54c).

const OPPONENT_DAMAGED = { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 } as const;
const BLOODTHIRST =
  "Bloodthirst 3 (If an opponent was dealt damage this turn, this creature enters with three +1/+1 counters on it.)";
const CAST_TEXT = "Whenever you cast a Vampire creature spell, it gains bloodthirst 3.";

export default defineCard({
  name: "Bloodlord of Vaasgoth",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `${BLOODTHIRST}\nFlying\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: OPPONENT_DAMAGED, then: 3, else: 0 } },
      },
      text: BLOODTHIRST,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", subtype: "Vampire" } },
      targets: [],
      effect: {
        kind: "enters-with-counters",
        target: "trigger-object",
        counter: "+1/+1",
        amount: 3,
        ifAsItEnters: OPPONENT_DAMAGED,
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
