import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 11129.
//
// Once per attacking Sliver, each about the player it attacks (or the
// controller of the planeswalker it attacks) — Campaign of Vengeance's shape.

const TEXT = "Whenever a Sliver you control attacks, defending player loses 1 life.";

export default defineCard({
  name: "Leeching Sliver",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Sliver" } },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
