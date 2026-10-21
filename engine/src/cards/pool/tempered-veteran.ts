import { defineCard } from "../define.js";

export default defineCard({
  name: "Tempered Veteran",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 2,
  text: "{W}, {T}: Put a +1/+1 counter on target creature with a +1/+1 counter on it.\n{4}{W}{W}, {T}: Put a +1/+1 counter on target creature.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{W}, {T}: Put a +1/+1 counter on target creature with a +1/+1 counter on it.",
    },
    {
      cost: { mana: "{4}{W}{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{4}{W}{W}, {T}: Put a +1/+1 counter on target creature.",
    },
  ],
});
