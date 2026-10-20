import { defineCard } from "../define.js";

// EDHREC rank 10774.
//
// Rulings:
//   [2021-09-24] Use Willow Geist's power as it last existed on the battlefield to determine how
//     much life you will gain as its last ability resolves.

export default defineCard({
  name: "Willow Geist",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["trample"],
  text: "Trample\nWhenever one or more cards leave your graveyard, put a +1/+1 counter on this creature.\nWhen this creature dies, you gain life equal to its power.",
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever one or more cards leave your graveyard, put a +1/+1 counter on this creature.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { powerOf: "source" } },
      resolve: null,
      text: "When this creature dies, you gain life equal to its power.",
    },
  ],
});
