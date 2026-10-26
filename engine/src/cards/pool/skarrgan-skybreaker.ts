import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 28824.
//
// Bloodthirst 3 (rule 702.54a): an enters-with-counters replacement, read as
// it enters, on whether any one opponent was dealt damage this turn. The
// sacrifice ability reads its power as it last existed (rule 608.2h).
const BLOODTHIRST =
  "Bloodthirst 3 (If an opponent was dealt damage this turn, this creature enters with three +1/+1 counters on it.)";
const FLING = "{1}, Sacrifice this creature: It deals damage equal to its power to any target.";

export default defineCard({
  name: "Skarrgan Skybreaker",
  manaCost: "{4}{R}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Giant", "Shaman"],
  power: 3,
  toughness: 3,
  text: `${BLOODTHIRST}\n${FLING}`,
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
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: FLING,
    },
  ],
});
