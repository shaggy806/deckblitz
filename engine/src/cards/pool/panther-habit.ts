import { defineCard } from "../define.js";

export default defineCard({
  name: "Panther Habit",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "If equipped creature would be dealt damage, prevent that damage and put that many +1/+1 counters on it.\nEquip {2}",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "attached",
        prevent: true,
        // "Would be dealt damage": once per damage event, "that many" its total (Anti-Venom's shape).
        perEvent: true,
        then: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: "x" },
      },
      text: "If equipped creature would be dealt damage, prevent that damage and put that many +1/+1 counters on it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
