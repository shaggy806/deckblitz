import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 28237.
//
// Bloodthirst 1: Bloodrage Vampire's enters-with-counters replacement. The
// sacrifice is Syr Ginger's: its power as it last existed on the battlefield.

const BLOODTHIRST =
  "Bloodthirst 1 (If an opponent was dealt damage this turn, this creature enters with a +1/+1 counter on it.)";
const SAC_TEXT = "Sacrifice this creature: You gain life equal to this creature's power.";

export default defineCard({
  name: "Gristleback",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar", "Beast"],
  power: 2,
  toughness: 2,
  text: `${BLOODTHIRST}\n${SAC_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 1,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { powerOf: "source" } },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
