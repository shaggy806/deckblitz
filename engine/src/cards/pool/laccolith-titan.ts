import { defineCard } from "../define.js";

// EDHREC rank 30413. Dwarven Vigilantes' shape on a becomes-blocked trigger.
//
// Rulings:
//   The ability is optional. You can decide to allow it to deal combat damage as normal.
//   The ability triggers even if a spell or ability makes it blocked.
//   It can target any creature on the battlefield, not just one of the ones blocking it.

const TEXT =
  "Whenever this creature becomes blocked, you may have it deal damage equal to its power to target creature. If you do, this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Laccolith Titan",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Laccolith Titan deal damage equal to its power to the targeted creature? It then assigns no combat damage.",
        effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
        then: { kind: "assigns-no-combat-damage", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
