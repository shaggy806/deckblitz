import { defineCard } from "../define.js";

// EDHREC rank 24592. Magic 2011.
//
// The target is chosen as it triggers, the "you may" at resolution; "if you
// do" the target then deals its power back (Predatory Urge's one-sided fight).
//
// Rulings:
//   [2010-08-15] If Cyclops Gladiator leaves the battlefield before the ability resolves, the
//     ability continues to resolve, dealing damage equal to the power it last had.
//   [2010-08-15] If the targeted creature leaves the battlefield (or otherwise becomes an illegal
//     target) before the ability resolves, the ability doesn't resolve.

const TEXT =
  "Whenever this creature attacks, you may have it deal damage equal to its power to target creature defending player controls. If you do, that creature deals damage equal to its power to this creature.";

export default defineCard({
  name: "Cyclops Gladiator",
  manaCost: "{1}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops", "Warrior"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: {
        kind: "may",
        prompt: "Have Cyclops Gladiator deal damage equal to its power to the targeted creature? It deals its power back.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: { powerOf: "source" }, target: 0 },
            { kind: "fight", a: 0, b: "source", oneSided: true },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
