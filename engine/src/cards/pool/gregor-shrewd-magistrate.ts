import { defineCard } from "../define.js";

// EDHREC rank 12878.

export default defineCard({
  name: "Gregor, Shrewd Magistrate",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 3,
  keywords: ["skulk"],
  text: "Skulk (This creature can't be blocked by creatures with greater power.)\nWhenever Gregor, Shrewd Magistrate deals combat damage to a player, draw cards equal to its power.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { powerOf: "source" } },
      resolve: null,
      text: "Whenever Gregor, Shrewd Magistrate deals combat damage to a player, draw cards equal to its power.",
    },
  ],
});
