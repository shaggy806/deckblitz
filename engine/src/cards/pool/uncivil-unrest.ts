import { defineCard } from "../define.js";

// The source's +1/+1 counter is read as the damage would be dealt.

const RIOT_TEXT = "Nontoken creatures you control have riot. (They enter with your choice of a +1/+1 counter or haste.)";
const DOUBLE_TEXT =
  "If a creature you control with a +1/+1 counter on it would deal damage to a permanent or player, it deals double that damage instead.";

export default defineCard({
  name: "Uncivil Unrest",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${RIOT_TEXT}\n${DOUBLE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: false, controlledBy: "you" } },
      grantKeywords: ["riot"],
      text: RIOT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        multiplier: 2,
        source: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      text: DOUBLE_TEXT,
    },
  ],
});
