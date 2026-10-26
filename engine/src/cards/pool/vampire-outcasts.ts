import { defineCard } from "../define.js";

// Bloodthirst 2 (rule 702.54a): "If an opponent was dealt damage this turn,
// this permanent enters with two +1/+1 counters on it" — damage dealt, not
// life lost (a prevented hit doesn't count; infect damage does).
const BLOODTHIRST_TEXT =
  "Bloodthirst 2 (If an opponent was dealt damage this turn, this creature enters with two +1/+1 counters on it.)";

export default defineCard({
  name: "Vampire Outcasts",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `${BLOODTHIRST_TEXT}\nLifelink (Damage dealt by this creature also causes you to gain that much life.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 2,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST_TEXT,
    },
  ],
});
