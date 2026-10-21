import { defineCard } from "../define.js";

const TEXT =
  "If a creature would deal combat damage to this creature, prevent that damage and put a +1/+1 counter on this creature.";

// Applied per source as damage is dealt (`Game.dealDamage`), so two blockers
// give two counters, however much each would have dealt (its ruling).

export default defineCard({
  name: "Ironscale Hydra",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 5,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: true,
        source: { type: "creature" },
        to: "self",
        prevent: true,
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      text: TEXT,
    },
  ],
});
