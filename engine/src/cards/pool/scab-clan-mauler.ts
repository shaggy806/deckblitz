import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 27644.
//
// Bloodthirst 2 (rule 702.54a): an enters-with-counters replacement, read as
// it enters, on whether any one opponent was dealt damage this turn.
const BLOODTHIRST =
  "Bloodthirst 2 (If an opponent was dealt damage this turn, this creature enters with two +1/+1 counters on it.)";

export default defineCard({
  name: "Scab-Clan Mauler",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 1,
  toughness: 1,
  keywords: ["trample"],
  text: `${BLOODTHIRST}\nTrample`,
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
      text: BLOODTHIRST,
    },
  ],
});
