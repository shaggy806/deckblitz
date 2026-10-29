import { defineCard } from "../define.js";

// "If a source would deal damage to you": per source, so two sources at once
// put two counters (the ruling). Damage that can't be prevented still puts
// the counter (the ruling — a prevention's other effects still happen,
// rule 615.12).
export default defineCard({
  name: "Nine Lives",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["hexproof"],
  text: "Hexproof\nIf a source would deal damage to you, prevent that damage and put an incarnation counter on this enchantment.\nWhen there are nine or more incarnation counters on this enchantment, exile it.\nWhen this enchantment leaves the battlefield, you lose the game.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "you",
        prevent: true,
        then: { kind: "add-counter", target: "source", counter: "incarnation", amount: 1 },
      },
      text: "If a source would deal damage to you, prevent that damage and put an incarnation counter on this enchantment.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "self-counters", counter: "incarnation", compare: { op: "gte", n: 9 } },
      },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: { kind: "exile", target: "source" },
      },
      resolve: null,
      text: "When there are nine or more incarnation counters on this enchantment, exile it.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-game" },
      resolve: null,
      text: "When this enchantment leaves the battlefield, you lose the game.",
    },
  ],
});
