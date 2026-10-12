import { defineCard } from "../define.js";

export default defineCard({
  name: "Kithkin Spellduster",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Wizard"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{1}{W}, Sacrifice this creature: Destroy target enchantment.\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, sacrifice: "self" },
      targets: ["enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{1}{W}, Sacrifice this creature: Destroy target enchantment.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "-1/-1", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "-1/-1", amount: 1 },
      },
      resolve: null,
      text: "Persist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
    },
  ],
});
