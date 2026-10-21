import { defineCard } from "../define.js";

// EDHREC rank 25828.

export default defineCard({
  name: "The Hive",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "{5}, {T}: Create a 1/1 colorless Insect artifact creature token with flying named Wasp. (It can't be blocked except by creatures with flying or reach.)",
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Wasp Token", count: 1 },
      resolve: null,
      text: "{5}, {T}: Create a 1/1 colorless Insect artifact creature token with flying named Wasp.",
    },
  ],
});
