import { defineCard } from "../define.js";

// EDHREC rank 12058.
//
// Rulings:
//   [2008-04-01] The creature's toughness is checked as this ability resolves. If the creature has
//     left the battlefield, use its last known information.

const TEXT = "Whenever another Treefolk creature you control enters, you may gain life equal to that creature's toughness.";

export default defineCard({
  name: "Orchard Warden",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Shaman"],
  power: 4,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Treefolk", type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Gain life equal to that creature's toughness?",
        effect: { kind: "gain-life", amount: { toughnessOf: "trigger-object" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
