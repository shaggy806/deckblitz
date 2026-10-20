import { defineCard } from "../define.js";

const STRIKE_TEXT = "Attacking creatures you control have first strike.";
const COUNTER_TEXT = "Whenever a Vampire you control deals combat damage to a player, put a +1/+1 counter on it.";

export default defineCard({
  name: "Stensia Masquerade",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  madness: { cost: "{2}{R}" },
  text: `${STRIKE_TEXT}
${COUNTER_TEXT}
Madness {2}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", attacking: true } },
      grantKeywords: ["first-strike"],
      text: STRIKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { subtype: "Vampire" } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
