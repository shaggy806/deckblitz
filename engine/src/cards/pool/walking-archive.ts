import { defineCard } from "../define.js";

export default defineCard({
  name: "Walking Archive",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 1,
  toughness: 1,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\nThis creature enters with a +1/+1 counter on it.\nAt the beginning of each player's upkeep, that player draws a card for each +1/+1 counter on this creature.\n{2}{W}{U}: Put a +1/+1 counter on this creature.",
  activated: [
    {
      cost: { mana: "{2}{W}{U}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{2}{W}{U}: Put a +1/+1 counter on this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "draw", who: "active-player", amount: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: "At the beginning of each player's upkeep, that player draws a card for each +1/+1 counter on this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "This creature enters with a +1/+1 counter on it.",
    },
  ],
});
