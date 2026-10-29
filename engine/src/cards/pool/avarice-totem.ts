import { defineCard } from "../define.js";

// EDHREC rank 14461.

export default defineCard({
  name: "Avarice Totem",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{5}: Exchange control of this artifact and target nonland permanent.",
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: ["nonland-permanent"],
      effect: { kind: "exchange-control", objects: ["source", 0] },
      resolve: null,
      text: "{5}: Exchange control of this artifact and target nonland permanent.",
    },
  ],
});
