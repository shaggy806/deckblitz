import { defineCard } from "../define.js";

// EDHREC rank 31358. Shadowmoor. "If you do": the life only when the target, still legal, has a
// -1/-1 counter to remove (Exemplar of Strength's shape, on a target).

const TEXT = "{W}, {T}: Remove a -1/-1 counter from target creature. If you do, you gain 2 life.";

export default defineCard({
  name: "Woeleecher",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { counters: { kind: "-1/-1", compare: { op: "gte", n: 1 } } } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "remove-counter", target: 0, counter: "-1/-1", amount: 1 },
            { kind: "gain-life", amount: 2 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
