import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] This ability checks whether you control any Goblins twice each turn: once when
//     the ability would trigger, and once when it resolves. If you control any Goblins at either
//     time, you won’t sacrifice Stenchskipper. (If you control any Goblins at the time the ability
//     would trigger, it doesn’t trigger at all.)

export default defineCard({
  name: "Stenchskipper",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of the end step, if you control no Goblins, sacrifice this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      // Intervening if (rule 603.4): checked as it triggers and as it resolves.
      condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Goblin" }, atLeast: 1 } },
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, if you control no Goblins, sacrifice this creature.",
    },
  ],
});
