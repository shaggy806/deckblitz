import { defineCard } from "../define.js";

const TEXT = "Whenever one or more nontoken Merfolk you control become tapped, create a 1/1 blue Merfolk creature token with hexproof.";

export default defineCard({
  name: "Deeproot Pilgrimage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "you-control", filter: { subtype: "Merfolk", token: false }, batched: true },
      targets: [],
      effect: { kind: "create-token", token: "Merfolk Token (Deeproot Waters)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
