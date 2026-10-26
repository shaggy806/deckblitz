import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 30200.
//
// Bloodthirst 3 (rule 702.54a): an enters-with-counters replacement, read as
// it enters, on whether any one opponent was dealt damage this turn.
const BLOODTHIRST =
  "Bloodthirst 3 (If an opponent was dealt damage this turn, this creature enters with three +1/+1 counters on it.)";

export default defineCard({
  name: "Ghor-Clan Savage",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Berserker"],
  power: 2,
  toughness: 3,
  text: BLOODTHIRST,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 3,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST,
    },
  ],
});
