import { defineCard } from "../define.js";

// Rulings:
//   If the target creature is an illegal target by the time Oblivion's Hunger tries to
//   resolve, the spell doesn't resolve. You don't draw a card.

export default defineCard({
  name: "Oblivion's Hunger",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: 'Target creature you control gains indestructible until end of turn. Draw a card if that creature has a +1/+1 counter on it. (Damage and effects that say "destroy" don\'t destroy the creature.)',
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
