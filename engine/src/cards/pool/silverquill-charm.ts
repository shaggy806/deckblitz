import { defineCard } from "../define.js";

export default defineCard({
  name: "Silverquill Charm",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Choose one —\n• Put two +1/+1 counters on target creature.\n• Exile target creature with power 2 or less.\n• Each opponent loses 3 life and you gain 3 life.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Put two +1/+1 counters on target creature.",
        targets: ["creature"],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      {
        text: "Exile target creature with power 2 or less.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "Each opponent loses 3 life and you gain 3 life.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 3, who: "each-opponent" },
            { kind: "gain-life", amount: 3 },
          ],
        },
      },
    ],
  },
});
